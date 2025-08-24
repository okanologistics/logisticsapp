const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  try {
    // Database configuration
    const dbConfig = {
      host: process.env.MYSQL_HOST || "localhost",
      user: process.env.MYSQL_USER || "root", 
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "okanodb"
    };

    console.log('🔄 Connecting to database...');
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Connected! Setting up database schema...');
    
    // Create tables one by one
    const tables = [
      {
        name: 'users',
        sql: `CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          email_verified BOOLEAN DEFAULT FALSE,
          email_verified_at TIMESTAMP NULL,
          reset_token VARCHAR(255) NULL,
          reset_token_expires TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'profiles',
        sql: `CREATE TABLE IF NOT EXISTS profiles (
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
        )`
      },
      {
        name: 'investors',
        sql: `CREATE TABLE IF NOT EXISTS investors (
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
        )`
      },
      {
        name: 'payments',
        sql: `CREATE TABLE IF NOT EXISTS payments (
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
        )`
      },
      {
        name: 'notifications',
        sql: `CREATE TABLE IF NOT EXISTS notifications (
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
        )`
      },
      {
        name: 'investment_details',
        sql: `CREATE TABLE IF NOT EXISTS investment_details (
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
        )`
      }
    ];

    // Create each table
    for (const table of tables) {
      try {
        await connection.execute(table.sql);
        console.log(`✅ Created table: ${table.name}`);
      } catch (error) {
        console.log(`ℹ️  Table ${table.name} already exists or error:`, error.message);
      }
    }
    
    // Check if we need to add sample data
    const [existingUsers] = await connection.query('SELECT COUNT(*) as count FROM users WHERE email LIKE "%example.com"');
    if (existingUsers[0].count === 0) {
      console.log('🔄 Adding sample data...');
      
      // Add sample users
      await connection.execute(`INSERT INTO users (id, email, password) VALUES (?, ?, ?)`, 
        ['sample-user-1', 'investor1@example.com', '$2a$10$sample_hashed_password']);
      await connection.execute(`INSERT INTO users (id, email, password) VALUES (?, ?, ?)`, 
        ['sample-user-2', 'investor2@example.com', '$2a$10$sample_hashed_password']);

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
    }
    
    // Test the setup by fetching some data
    const [investors] = await connection.query('SELECT * FROM investors LIMIT 5');
    const [payments] = await connection.query('SELECT * FROM payments LIMIT 5');
    
    console.log('📊 Sample investor data:', investors.length, 'records');
    console.log('💰 Sample payment data:', payments.length, 'records');
    console.log('First investor:', investors[0]?.full_name || 'None');
    
    await connection.end();
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
