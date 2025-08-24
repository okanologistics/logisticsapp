import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'okanologistics@123!'
};

export async function GET() {
  let connection;
  try {
    // First create a connection without specifying a database
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DATABASE || 'okanodb'}`);
    console.log('Database created or already exists');

    // Use the database
    await connection.query(`USE ${process.env.MYSQL_DATABASE || 'okanodb'}`);
    console.log('Using database');

    // Drop existing tables if they exist - in correct order to handle foreign keys
    await connection.query('DROP TABLE IF EXISTS profiles');
    await connection.query('DROP TABLE IF EXISTS payments');
    await connection.query('DROP TABLE IF EXISTS notifications');
    await connection.query('DROP TABLE IF EXISTS investors');
    await connection.query('DROP TABLE IF EXISTS users');
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Users table created');

    // Create profiles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'investor',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Profiles table created');

    // Create admin user
    const adminEmail = 'samuelekelejnr@gmail.com';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Check if admin exists
    const [existingUsers]: any = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [adminEmail]
    );

    let userId;
    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      console.log('Admin user already exists');
      
      // Check if profile exists for existing user
      const [existingProfile]: any = await connection.query(
        'SELECT id FROM profiles WHERE user_id = ?',
        [userId]
      );
      
      if (existingProfile.length === 0) {
        const profileId = randomUUID();
        await connection.query(
          'INSERT INTO profiles (id, user_id, role) VALUES (?, ?, ?)',
          [profileId, userId, 'admin']
        );
        console.log('Admin profile created for existing user');
      } else {
        console.log('Admin profile already exists');
      }
    } else {
      // Generate new UUIDs for new user
      userId = randomUUID();
      const profileId = randomUUID();
      
      // Create admin user
      await connection.query(
        'INSERT INTO users (id, email, password) VALUES (?, ?, ?)',
        [userId, adminEmail, hashedPassword]
      );
      console.log('Admin user created');

      // Create admin profile
      await connection.query(
        'INSERT INTO profiles (id, user_id, role) VALUES (?, ?, ?)',
        [profileId, userId, 'admin']
      );
      console.log('Admin profile created');
    }
    console.log('Admin profile created/updated');

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      adminCredentials: {
        email: adminEmail,
        password: adminPassword
      }
    });

  } catch (error: any) {
    console.error('Database initialization error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });

  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}
