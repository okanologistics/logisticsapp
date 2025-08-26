const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

async function migrateInvestorData() {
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
    
    // Find users with investor role who don't have corresponding investor records
    console.log('🔍 Finding investor profiles without investor records...');
    
    const [missingInvestors] = await connection.execute(`
      SELECT DISTINCT 
        u.id as user_id,
        u.email,
        p.full_name,
        p.phone_number,
        inv.total_investment,
        inv.number_of_bikes,
        inv.monthly_return,
        inv.investment_date,
        inv.investment_status
      FROM users u
      JOIN profiles p ON u.id = p.user_id
      LEFT JOIN investment_details inv ON u.id = inv.investor_id
      LEFT JOIN investors i ON u.id = i.user_id
      WHERE p.role = 'investor' 
        AND i.id IS NULL
    `);
    
    console.log(`Found ${missingInvestors.length} investor profiles without investor records`);
    
    if (missingInvestors.length === 0) {
      console.log('✅ No migration needed - all investor profiles have corresponding investor records');
      return;
    }
    
    // Create investor records for missing entries
    console.log('📝 Creating missing investor records...');
    
    for (const missing of missingInvestors) {
      const investorId = uuidv4();
      
      await connection.execute(`
        INSERT INTO investors (
          id, user_id, full_name, email, phone_number,
          total_investment, number_of_bikes, monthly_return,
          investment_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        investorId,
        missing.user_id,
        missing.full_name || '',
        missing.email,
        missing.phone_number || '',
        missing.total_investment || 0,
        missing.number_of_bikes || 1,
        missing.monthly_return || 0,
        missing.investment_date || new Date().toISOString().split('T')[0],
        missing.investment_status || 'active'
      ]);
      
      console.log(`✅ Created investor record for ${missing.email} (${missing.full_name})`);
    }
    
    // Verify the migration
    const [verificationCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM investors
    `);
    
    const [profileCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM profiles WHERE role = 'investor'
    `);
    
    console.log(`📊 Migration Summary:`);
    console.log(`   - Investor profiles: ${profileCount[0].count}`);
    console.log(`   - Investor records: ${verificationCount[0].count}`);
    
    if (profileCount[0].count === verificationCount[0].count) {
      console.log('✅ Migration successful - all investor profiles now have corresponding investor records!');
    } else {
      console.log('⚠️ Warning: Mismatch between investor profiles and investor records');
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

migrateInvestorData()
  .then(() => {
    console.log('🎉 Migration completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Migration failed:', error.message);
    process.exit(1);
  });
