const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function createTables() {
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
    
    // Create users table
    console.log('Creating users table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email_verified BOOLEAN DEFAULT FALSE,
        email_verified_at TIMESTAMP NULL,
        reset_token VARCHAR(255) NULL,
        reset_token_expires TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create profiles table
    console.log('Creating profiles table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS profiles (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        role ENUM('admin', 'investor') NOT NULL DEFAULT 'investor',
        full_name VARCHAR(255),
        phone_number VARCHAR(20),
        profile_image VARCHAR(500),
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Create investors table
    console.log('Creating investors table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS investors (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        full_name VARCHAR(255),
        email VARCHAR(255),
        phone_number VARCHAR(20),
        total_investment DECIMAL(12, 2) DEFAULT 0,
        number_of_bikes INT DEFAULT 1,
        monthly_return DECIMAL(12, 2) DEFAULT 0,
        total_return DECIMAL(12, 2) DEFAULT 0,
        interest_earned DECIMAL(12, 2) DEFAULT 0,
        investment_date DATE,
        maturity_date DATE,
        next_payout_date DATE,
        last_payout_date DATE,
        status ENUM('pending', 'active', 'inactive') DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Create payments table
    console.log('Creating payments table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(36) PRIMARY KEY,
        investor_id VARCHAR(36) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        total_amount DECIMAL(12, 2),
        interest_amount DECIMAL(12, 2),
        principal_amount DECIMAL(12, 2),
        payment_date DATE,
        payment_type VARCHAR(50) DEFAULT 'monthly_return',
        payout_frequency ENUM('weekly', 'monthly') DEFAULT 'monthly',
        status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (investor_id) REFERENCES investors(id) ON DELETE CASCADE
      )
    `);
    
    // Create notifications table
    console.log('Creating notifications table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        investor_id VARCHAR(36),
        type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (investor_id) REFERENCES investors(id) ON DELETE CASCADE
      )
    `);
    
    // Create investment_details table (used by admin dashboard)
    console.log('Creating investment_details table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS investment_details (
        id VARCHAR(36) PRIMARY KEY,
        investor_id VARCHAR(36) NOT NULL,
        total_investment DECIMAL(12, 2) DEFAULT 0,
        number_of_bikes INT DEFAULT 1,
        monthly_return DECIMAL(12, 2) DEFAULT 0,
        investment_date DATE,
        maturity_date DATE,
        next_payout_date DATE,
        investment_status ENUM('pending', 'active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (investor_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    console.log('✅ All tables created successfully!');
    
    // Show created tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Created tables:', tables.map(t => Object.values(t)[0]).join(', '));
    
    // Create a test admin user
    console.log('Creating test admin user...');
    const bcrypt = require('bcryptjs');
    const { v4: uuidv4 } = require('uuid');
    
    const userId = uuidv4();
    const profileId = uuidv4();
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await connection.execute(`
      INSERT IGNORE INTO users (id, email, password) 
      VALUES (?, ?, ?)
    `, [userId, 'admin@okanologistics.com', hashedPassword]);
    
    await connection.execute(`
      INSERT IGNORE INTO profiles (id, user_id, role, full_name) 
      VALUES (?, ?, ?, ?)
    `, [profileId, userId, 'admin', 'System Administrator']);
    
    console.log('✅ Test admin user created: admin@okanologistics.com / admin123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

createTables()
  .then(() => {
    console.log('🎉 Database setup completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Failed:', error.message);
    process.exit(1);
  });
