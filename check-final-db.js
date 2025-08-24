const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
  try {
    const dbConfig = {
      host: process.env.MYSQL_HOST || "localhost",
      user: process.env.MYSQL_USER || "root", 
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "okanodb"
    };

    console.log('🔄 Connecting to database...');
    const connection = await mysql.createConnection(dbConfig);
    
    // Check tables
    const [tables] = await connection.query("SHOW TABLES");
    console.log('📋 Available tables:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    // Check users count
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Total users: ${users[0].count}`);

    // Check if we have any existing data
    const [existingUsers] = await connection.query('SELECT email FROM users LIMIT 5');
    console.log('📧 Existing user emails:', existingUsers.map(u => u.email));

    // Check profiles
    const [profiles] = await connection.query('SELECT user_id, full_name, role FROM profiles LIMIT 5');
    console.log('👤 Existing profiles:');
    profiles.forEach(profile => {
      console.log(`  - ${profile.full_name || 'No name'} (${profile.role})`);
    });

    // Check investors table structure
    const [investorColumns] = await connection.query("SHOW COLUMNS FROM investors");
    console.log('💼 Investors table columns:');
    investorColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    // Check if we can insert sample data now
    console.log('\n🔄 Adding sample investor data...');
    
    // First check if we have any actual user data to work with
    const [realUsers] = await connection.query('SELECT id, email FROM users WHERE email NOT LIKE "%example.com" LIMIT 2');
    
    if (realUsers.length > 0) {
      console.log('Using existing user data...');
      for (let i = 0; i < Math.min(realUsers.length, 2); i++) {
        const user = realUsers[i];
        const investorId = `investor-real-${i + 1}`;
        
        try {
          await connection.execute(`INSERT IGNORE INTO investors (
            id, user_id, full_name, email, total_investment, 
            number_of_bikes, monthly_return, investment_date, status, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [investorId, user.id, `Investor ${i + 1}`, user.email,
             1400000 * (i + 1), i + 1, 280000 * (i + 1), '2024-01-15', 'active', `Investment for ${i + 1} bike(s)`]);
             
          // Add corresponding payment
          await connection.execute(`INSERT IGNORE INTO payments (
            id, investor_id, amount, total_amount, interest_amount, payment_date, payment_type, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
            [`payment-real-${i + 1}`, investorId, 280000 * (i + 1), 280000 * (i + 1), 280000 * (i + 1), '2024-03-15', 'monthly_return', 'completed']);
            
          console.log(`✅ Added investor data for user: ${user.email}`);
        } catch (error) {
          console.log(`⚠️  Could not add investor for ${user.email}:`, error.message);
        }
      }
    } else {
      console.log('No existing users found, adding sample users...');
      
      // Add sample users and data
      try {
        await connection.execute(`INSERT IGNORE INTO users (id, email, password) VALUES (?, ?, ?)`, 
          ['sample-user-1', 'investor1@example.com', '$2a$10$YourHashedPasswordHere']);
        await connection.execute(`INSERT IGNORE INTO users (id, email, password) VALUES (?, ?, ?)`, 
          ['sample-user-2', 'investor2@example.com', '$2a$10$YourHashedPasswordHere']);

        // Add sample profiles
        await connection.execute(`INSERT IGNORE INTO profiles (id, user_id, role, full_name, phone_number) VALUES (?, ?, ?, ?, ?)`, 
          ['profile-1', 'sample-user-1', 'investor', 'John Doe', '+2348012345678']);
        await connection.execute(`INSERT IGNORE INTO profiles (id, user_id, role, full_name, phone_number) VALUES (?, ?, ?, ?, ?)`, 
          ['profile-2', 'sample-user-2', 'investor', 'Jane Smith', '+2348087654321']);

        // Add sample investors
        await connection.execute(`INSERT IGNORE INTO investors (
          id, user_id, full_name, email, phone_number, total_investment, 
          number_of_bikes, monthly_return, investment_date, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
          ['investor-1', 'sample-user-1', 'John Doe', 'investor1@example.com', '+2348012345678',
           1400000, 1, 280000, '2024-01-15', 'active', 'Initial investment for 1 bike']);
           
        await connection.execute(`INSERT IGNORE INTO investors (
          id, user_id, full_name, email, phone_number, total_investment, 
          number_of_bikes, monthly_return, investment_date, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
          ['investor-2', 'sample-user-2', 'Jane Smith', 'investor2@example.com', '+2348087654321',
           2800000, 2, 560000, '2024-02-01', 'active', 'Investment for 2 bikes']);

        // Add sample payments
        await connection.execute(`INSERT IGNORE INTO payments (
          id, investor_id, amount, total_amount, interest_amount, payment_date, payment_type, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
          ['payment-1', 'investor-1', 280000, 280000, 280000, '2024-02-15', 'monthly_return', 'completed']);
          
        await connection.execute(`INSERT IGNORE INTO payments (
          id, investor_id, amount, total_amount, interest_amount, payment_date, payment_type, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
          ['payment-2', 'investor-2', 560000, 560000, 560000, '2024-03-01', 'monthly_return', 'completed']);
        
        console.log('✅ Sample users and investors added!');
      } catch (error) {
        console.log('⚠️  Error adding sample data:', error.message);
      }
    }

    // Final count
    const [finalInvestors] = await connection.query('SELECT COUNT(*) as count FROM investors');
    const [finalPayments] = await connection.query('SELECT COUNT(*) as count FROM payments');
    
    console.log(`\n📊 Final counts:`);
    console.log(`   Investors: ${finalInvestors[0].count}`);
    console.log(`   Payments: ${finalPayments[0].count}`);

    if (finalInvestors[0].count > 0) {
      const [sampleInvestors] = await connection.query('SELECT full_name, email, total_investment FROM investors LIMIT 3');
      console.log('\n💼 Sample investors:');
      sampleInvestors.forEach(inv => {
        console.log(`   - ${inv.full_name}: ₦${inv.total_investment.toLocaleString()}`);
      });
    }

    await connection.end();
    console.log('\n🎉 Database check completed!');
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

checkDatabase();
