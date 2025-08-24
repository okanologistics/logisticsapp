const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function updateDatabase() {
  try {
    const dbConfig = {
      host: process.env.MYSQL_HOST || "localhost",
      user: process.env.MYSQL_USER || "root", 
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "okanodb"
    };

    console.log('🔄 Connecting to database...');
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Connected! Updating database schema...');
    
    // Step 1: Update profiles table to add missing columns
    try {
      await connection.execute('ALTER TABLE profiles ADD COLUMN full_name VARCHAR(255)');
      console.log('✅ Added full_name to profiles table');
    } catch (error) {
      console.log('ℹ️  full_name column already exists in profiles');
    }
    
    try {
      await connection.execute('ALTER TABLE profiles ADD COLUMN phone_number VARCHAR(20)');
      console.log('✅ Added phone_number to profiles table');
    } catch (error) {
      console.log('ℹ️  phone_number column already exists in profiles');
    }

    try {
      await connection.execute('ALTER TABLE profiles ADD COLUMN profile_image VARCHAR(500)');
      console.log('✅ Added profile_image to profiles table');
    } catch (error) {
      console.log('ℹ️  profile_image column already exists in profiles');
    }

    try {
      await connection.execute('ALTER TABLE profiles ADD COLUMN last_login TIMESTAMP NULL');
      console.log('✅ Added last_login to profiles table');
    } catch (error) {
      console.log('ℹ️  last_login column already exists in profiles');
    }
    
    // Step 2: Create investors table
    try {
      await connection.execute(`CREATE TABLE IF NOT EXISTS investors (
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
        INDEX idx_user_id (user_id)
      )`);
      console.log('✅ Created investors table');
    } catch (error) {
      console.log('ℹ️  investors table creation error:', error.message);
    }
    
    // Step 3: Create payments table
    try {
      await connection.execute(`CREATE TABLE IF NOT EXISTS payments (
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
        INDEX idx_investor_id (investor_id)
      )`);
      console.log('✅ Created payments table');
    } catch (error) {
      console.log('ℹ️  payments table creation error:', error.message);
    }

    // Step 4: Create notifications table
    try {
      await connection.execute(`CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        investor_id VARCHAR(36),
        type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_investor_id (investor_id)
      )`);
      console.log('✅ Created notifications table');
    } catch (error) {
      console.log('ℹ️  notifications table creation error:', error.message);
    }
    
    // Step 5: Add sample data
    console.log('🔄 Adding sample data...');
    
    // Check if sample data already exists
    const [existingUsers] = await connection.query('SELECT COUNT(*) as count FROM users WHERE email LIKE "%example.com"');
    if (existingUsers[0].count === 0) {
      // Add sample users
      await connection.execute(`INSERT INTO users (id, email, password) VALUES (?, ?, ?)`, 
        ['sample-user-1', 'investor1@example.com', '$2a$10$YourHashedPasswordHere']);
      await connection.execute(`INSERT INTO users (id, email, password) VALUES (?, ?, ?)`, 
        ['sample-user-2', 'investor2@example.com', '$2a$10$YourHashedPasswordHere']);

      // Add sample profiles
      await connection.execute(`INSERT INTO profiles (id, user_id, role, full_name, phone_number) VALUES (?, ?, ?, ?, ?)`, 
        ['profile-1', 'sample-user-1', 'investor', 'John Doe', '+2348012345678']);
      await connection.execute(`INSERT INTO profiles (id, user_id, role, full_name, phone_number) VALUES (?, ?, ?, ?, ?)`, 
        ['profile-2', 'sample-user-2', 'investor', 'Jane Smith', '+2348087654321']);

      // Add sample investors
      await connection.execute(`INSERT INTO investors (
        id, user_id, full_name, email, phone_number, total_investment, 
        number_of_bikes, monthly_return, investment_date, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['investor-1', 'sample-user-1', 'John Doe', 'investor1@example.com', '+2348012345678',
         1400000, 1, 280000, '2024-01-15', 'active', 'Initial investment for 1 bike']);
         
      await connection.execute(`INSERT INTO investors (
        id, user_id, full_name, email, phone_number, total_investment, 
        number_of_bikes, monthly_return, investment_date, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['investor-2', 'sample-user-2', 'Jane Smith', 'investor2@example.com', '+2348087654321',
         2800000, 2, 560000, '2024-02-01', 'active', 'Investment for 2 bikes']);

      // Add sample payments
      await connection.execute(`INSERT INTO payments (
        id, investor_id, amount, total_amount, interest_amount, payment_date, payment_type, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['payment-1', 'investor-1', 280000, 280000, 280000, '2024-02-15', 'monthly_return', 'completed']);
        
      await connection.execute(`INSERT INTO payments (
        id, investor_id, amount, total_amount, interest_amount, payment_date, payment_type, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['payment-2', 'investor-1', 280000, 280000, 280000, '2024-03-15', 'monthly_return', 'completed']);
        
      await connection.execute(`INSERT INTO payments (
        id, investor_id, amount, total_amount, interest_amount, payment_date, payment_type, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['payment-3', 'investor-2', 560000, 560000, 560000, '2024-03-01', 'monthly_return', 'completed']);
      
      console.log('✅ Sample data added successfully!');
    } else {
      console.log('ℹ️  Sample data already exists, skipping...');
    }
    
    // Test the setup by fetching some data
    const [investors] = await connection.query('SELECT * FROM investors LIMIT 5');
    const [payments] = await connection.query('SELECT * FROM payments LIMIT 5');
    
    console.log('📊 Total investors:', investors.length);
    console.log('💰 Total payments:', payments.length);
    
    if (investors.length > 0) {
      console.log('👤 First investor:', investors[0].full_name);
    }
    
    await connection.end();
    console.log('🎉 Database update completed successfully!');
    
  } catch (error) {
    console.error('❌ Database update failed:', error);
  }
}

updateDatabase();
