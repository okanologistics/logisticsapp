import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    // Create connection to MySQL
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'okanologistics@123!'
    });

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS okanodb`);
    await connection.query(`USE okanodb`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create profiles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'investor',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE KEY unique_user_id (user_id)
      )
    `);

    // Create admin user if it doesn't exist
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Insert admin user with error handling for duplicate entry
    try {
      const [userResult]: any = await connection.query(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        ['samuelekelejnr@gmail.com', hashedPassword]
      );

      if (userResult.insertId) {
        // Get the user's ID (needed for MySQL 8+)
        const [rows]: any = await connection.query(
          'SELECT id FROM users WHERE email = ?',
          ['samuelekelejnr@gmail.com']
        );
        
        const userId = rows[0].id;

        // Create admin profile
        await connection.query(
          'INSERT INTO profiles (user_id, role) VALUES (?, ?)',
          [userId, 'admin']
        );
      }
    } catch (err: any) {
      // Ignore duplicate entry errors (user already exists)
      if (err.code !== 'ER_DUP_ENTRY') {
        throw err;
      }
    }

    await connection.end();

    return NextResponse.json({
      message: 'Database initialized successfully',
      credentials: {
        email: 'samuelekelejnr@gmail.com',
        password: 'admin123'
      }
    });
  } catch (error: any) {
    console.error('Database initialization error:', error);
    return NextResponse.json({
      error: 'Failed to initialize database',
      details: error.message
    }, { status: 500 });
  }
}
