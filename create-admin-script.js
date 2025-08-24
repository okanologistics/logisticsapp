const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function createAdminUser() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  try {
    const adminPassword = 'admin123'; // Change this to your desired admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const userId = uuidv4();

    // Create admin user
    await connection.execute(
      'INSERT INTO users (id, email, password, email_verified) VALUES (?, ?, ?, true)',
      [userId, 'samuelekelejnr@gmail.com', hashedPassword]
    );

    // Create admin profile
    await connection.execute(
      'INSERT INTO profiles (id, user_id, role) VALUES (?, ?, ?)',
      [uuidv4(), userId, 'admin']
    );

    console.log('Admin user created successfully!');
    console.log('Email: samuelekelejnr@gmail.com');
    console.log('Password:', adminPassword);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await connection.end();
  }
}

createAdminUser();
