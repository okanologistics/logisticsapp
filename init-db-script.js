const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'okanologistics@123!',
    database: 'okanodb',
    multipleStatements: true
  });

  try {
    // Create tables
    await connection.query(`
      -- Drop existing tables
      DROP TABLE IF EXISTS investors;
      DROP TABLE IF EXISTS profiles;
      DROP TABLE IF EXISTS users;

      -- Create users table
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY,
        email VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
        password VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        email_verified TINYINT(1) DEFAULT 0,
        email_verified_at TIMESTAMP NULL,
        reset_token VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
        reset_token_expires TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

      -- Create profiles table
      CREATE TABLE IF NOT EXISTS profiles (
        id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY,
        user_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        role ENUM('admin', 'investor') NOT NULL DEFAULT 'investor',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

      -- Create investors table
      CREATE TABLE IF NOT EXISTS investors (
        id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY,
        user_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        full_name VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);

    // Create admin user
    const adminId = uuidv4();
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await connection.query(
      'INSERT INTO users (id, email, password, email_verified) VALUES (?, ?, ?, true)',
      [adminId, 'samuelekelejnr@gmail.com', hashedPassword]
    );

    await connection.query(
      'INSERT INTO profiles (id, user_id, role) VALUES (?, ?, ?)',
      [uuidv4(), adminId, 'admin']
    );

    console.log('Database initialized successfully!');
    console.log('Admin user created:');
    console.log('Email: samuelekelejnr@gmail.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await connection.end();
  }
}

initializeDatabase();
