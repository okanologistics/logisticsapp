const mysql = require('mysql2/promise');

/**
 * Database Migration Script for Cloud Deployment
 * Run this after setting up your cloud MySQL database
 */

async function migrateDatabase() {
  console.log('🚀 Starting database migration for cloud deployment...');

  try {
    // Check for required environment variables
    const requiredEnvVars = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars.join(', '));
      console.error('Please set these in your .env file or Vercel environment variables');
      process.exit(1);
    }

    const dbConfig = {
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
    };

    console.log('🔄 Connecting to database...');
    console.log(`Host: ${dbConfig.host}`);
    console.log(`Database: ${dbConfig.database}`);
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful!');

    // Create users table
    console.log('📋 Creating users table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      )
    `);

    // Create profiles table
    console.log('📋 Creating profiles table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS profiles (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) UNIQUE NOT NULL,
        role ENUM('admin', 'investor') NOT NULL DEFAULT 'investor',
        full_name VARCHAR(255),
        phone_number VARCHAR(20),
        profile_image VARCHAR(500),
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id)
      )
    `);

    // Create investors table
    console.log('📋 Creating investors table...');
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
        INDEX idx_user_id (user_id)
      )
    `);

    // Create payments table
    console.log('📋 Creating payments table...');
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
        INDEX idx_investor_id (investor_id)
      )
    `);

    // Create notifications table
    console.log('📋 Creating notifications table...');
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
        INDEX idx_user_id (user_id),
        INDEX idx_investor_id (investor_id)
      )
    `);

    // Create investment_details table (if needed for compatibility)
    console.log('📋 Creating investment_details table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS investment_details (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        investment_amount DECIMAL(12, 2) NOT NULL,
        bike_count INT DEFAULT 1,
        status ENUM('pending', 'active', 'completed') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id)
      )
    `);

    console.log('✅ All tables created successfully!');

    // Add sample admin user if no users exist
    const [existingUsers] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count === 0) {
      console.log('👤 Creating sample admin user...');
      
      const adminId = 'admin-' + Date.now();
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);

      await connection.execute(
        'INSERT INTO users (id, email, password) VALUES (?, ?, ?)',
        [adminId, 'admin@okanologistics.com', hashedPassword]
      );

      await connection.execute(
        'INSERT INTO profiles (id, user_id, role, full_name) VALUES (?, ?, ?, ?)',
        ['profile-' + adminId, adminId, 'admin', 'System Administrator']
      );

      console.log('✅ Sample admin user created!');
      console.log('   Email: admin@okanologistics.com');
      console.log('   Password: admin123');
      console.log('   🚨 CHANGE THE PASSWORD IMMEDIATELY AFTER FIRST LOGIN!');
    }

    // Test all tables
    console.log('🧪 Testing database setup...');
    const tables = ['users', 'profiles', 'investors', 'payments', 'notifications', 'investment_details'];
    
    for (const table of tables) {
      const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`   ✅ ${table}: ${rows[0].count} records`);
    }

    await connection.end();
    console.log('🎉 Database migration completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('1. Deploy your application to Vercel');
    console.log('2. Set the environment variables in Vercel dashboard');
    console.log('3. Test the application');
    console.log('4. Change the admin password');
    
  } catch (error) {
    console.error('❌ Database migration failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check your database credentials');
    console.error('2. Ensure the database exists');
    console.error('3. Verify network connectivity');
    console.error('4. Check if SSL is required');
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateDatabase();
}

module.exports = migrateDatabase;
