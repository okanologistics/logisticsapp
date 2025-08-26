const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

async function createAdminUser() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD || process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    connectTimeout: 60000
  });

  try {
    console.log('✅ Connected to database!');
    
    const email = 'realsammy86@gmail.com';
    const fullName = 'Samuel Ekele';
    const password = 'Sammy4real';
    
    // Generate IDs
    const userId = uuidv4();
    const profileId = uuidv4();
    
    // Hash the password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user already exists
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUser.length > 0) {
      console.log('⚠️  User already exists, updating password...');
      
      // Update existing user
      await connection.execute(
        'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
        [hashedPassword, email]
      );
      
      // Update profile
      await connection.execute(
        'UPDATE profiles SET full_name = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = (SELECT id FROM users WHERE email = ?)',
        [fullName, email]
      );
      
      console.log('✅ Existing user updated successfully!');
    } else {
      console.log('➕ Creating new admin user...');
      
      // Insert new user
      await connection.execute(
        'INSERT INTO users (id, email, password, email_verified, created_at, updated_at) VALUES (?, ?, ?, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        [userId, email, hashedPassword]
      );
      
      // Insert profile
      await connection.execute(
        'INSERT INTO profiles (id, user_id, role, full_name, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        [profileId, userId, 'admin', fullName]
      );
      
      console.log('✅ New admin user created successfully!');
    }
    
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${fullName}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🛡️  Role: admin`);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

createAdminUser()
  .then(() => {
    console.log('🎉 Admin user setup completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Failed to create admin user:', error.message);
    process.exit(1);
  });
