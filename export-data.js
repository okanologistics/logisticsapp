const mysql = require('mysql2/promise');
const fs = require('fs').promises;

/**
 * Export Local Database Data for Cloud Migration
 * Use this to backup your local data before migrating to cloud
 */

async function exportData() {
  console.log('📦 Starting data export from local database...');

  try {
    const dbConfig = {
      host: 'localhost',
      user: 'root',
      password: 'okanologistics@123!',
      database: 'okanodb'
    };

    console.log('🔄 Connecting to local database...');
    const connection = await mysql.createConnection(dbConfig);

    const exportData = {
      timestamp: new Date().toISOString(),
      users: [],
      profiles: [],
      investors: [],
      payments: [],
      investment_details: []
    };

    // Export users
    console.log('👥 Exporting users...');
    const [users] = await connection.query('SELECT * FROM users');
    exportData.users = users;
    console.log(`   ✅ Exported ${users.length} users`);

    // Export profiles  
    console.log('👤 Exporting profiles...');
    const [profiles] = await connection.query('SELECT * FROM profiles');
    exportData.profiles = profiles;
    console.log(`   ✅ Exported ${profiles.length} profiles`);

    // Export investors
    console.log('💼 Exporting investors...');
    const [investors] = await connection.query('SELECT * FROM investors');
    exportData.investors = investors;
    console.log(`   ✅ Exported ${investors.length} investors`);

    // Export payments
    console.log('💰 Exporting payments...');
    const [payments] = await connection.query('SELECT * FROM payments');
    exportData.payments = payments;
    console.log(`   ✅ Exported ${payments.length} payments`);

    // Export investment_details if exists
    try {
      console.log('📊 Exporting investment details...');
      const [investmentDetails] = await connection.query('SELECT * FROM investment_details');
      exportData.investment_details = investmentDetails;
      console.log(`   ✅ Exported ${investmentDetails.length} investment details`);
    } catch (error) {
      console.log('   ℹ️  investment_details table not found, skipping...');
    }

    await connection.end();

    // Save to file
    const filename = `data-export-${Date.now()}.json`;
    await fs.writeFile(filename, JSON.stringify(exportData, null, 2));
    
    console.log(`✅ Data exported successfully to: ${filename}`);
    console.log('\n📋 Export Summary:');
    console.log(`   Users: ${exportData.users.length}`);
    console.log(`   Profiles: ${exportData.profiles.length}`);
    console.log(`   Investors: ${exportData.investors.length}`);
    console.log(`   Payments: ${exportData.payments.length}`);
    console.log(`   Investment Details: ${exportData.investment_details.length}`);

    // Create import script content
    const importScript = generateImportScript(exportData);
    const importFilename = `import-data-${Date.now()}.js`;
    await fs.writeFile(importFilename, importScript);
    
    console.log(`✅ Import script created: ${importFilename}`);
    console.log('\n📝 Next Steps:');
    console.log('1. Set up your cloud database');
    console.log('2. Run the migration script: npm run migrate');
    console.log(`3. Run the import script: node ${importFilename}`);

  } catch (error) {
    console.error('❌ Export failed:', error.message);
    console.error('\n🔧 Make sure your local database is running and accessible');
  }
}

function generateImportScript(data) {
  return `const mysql = require('mysql2/promise');

/**
 * Import Data to Cloud Database
 * Generated on: ${new Date().toISOString()}
 */

async function importData() {
  console.log('📥 Starting data import to cloud database...');
  
  try {
    const dbConfig = {
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
    };

    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to cloud database');

    const data = ${JSON.stringify(data, null, 4)};

    // Import users
    console.log('👥 Importing users...');
    for (const user of data.users) {
      try {
        await connection.execute(
          'INSERT IGNORE INTO users (id, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
          [user.id, user.email, user.password, user.created_at, user.updated_at]
        );
      } catch (error) {
        console.log(\`   ⚠️  Skipped user \${user.email}: \${error.message}\`);
      }
    }
    console.log(\`   ✅ Imported \${data.users.length} users\`);

    // Import profiles
    console.log('👤 Importing profiles...');
    for (const profile of data.profiles) {
      try {
        await connection.execute(
          'INSERT IGNORE INTO profiles (id, user_id, role, full_name, phone_number, profile_image, last_login, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [profile.id, profile.user_id, profile.role, profile.full_name, profile.phone_number, profile.profile_image, profile.last_login, profile.created_at, profile.updated_at]
        );
      } catch (error) {
        console.log(\`   ⚠️  Skipped profile \${profile.id}: \${error.message}\`);
      }
    }
    console.log(\`   ✅ Imported \${data.profiles.length} profiles\`);

    // Import investors
    console.log('💼 Importing investors...');
    for (const investor of data.investors) {
      try {
        await connection.execute(
          'INSERT IGNORE INTO investors (id, user_id, full_name, email, phone_number, total_investment, number_of_bikes, monthly_return, total_return, interest_earned, investment_date, maturity_date, next_payout_date, last_payout_date, status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [investor.id, investor.user_id, investor.full_name, investor.email, investor.phone_number, investor.total_investment, investor.number_of_bikes, investor.monthly_return, investor.total_return, investor.interest_earned, investor.investment_date, investor.maturity_date, investor.next_payout_date, investor.last_payout_date, investor.status, investor.notes, investor.created_at, investor.updated_at]
        );
      } catch (error) {
        console.log(\`   ⚠️  Skipped investor \${investor.id}: \${error.message}\`);
      }
    }
    console.log(\`   ✅ Imported \${data.investors.length} investors\`);

    // Import payments
    console.log('💰 Importing payments...');
    for (const payment of data.payments) {
      try {
        await connection.execute(
          'INSERT IGNORE INTO payments (id, investor_id, amount, total_amount, interest_amount, principal_amount, payment_date, payment_type, payout_frequency, status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [payment.id, payment.investor_id, payment.amount, payment.total_amount, payment.interest_amount, payment.principal_amount, payment.payment_date, payment.payment_type, payment.payout_frequency, payment.status, payment.notes, payment.created_at, payment.updated_at]
        );
      } catch (error) {
        console.log(\`   ⚠️  Skipped payment \${payment.id}: \${error.message}\`);
      }
    }
    console.log(\`   ✅ Imported \${data.payments.length} payments\`);

    await connection.end();
    console.log('🎉 Data import completed successfully!');

  } catch (error) {
    console.error('❌ Import failed:', error.message);
  }
}

importData();`;
}

exportData();
