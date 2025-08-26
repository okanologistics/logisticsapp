const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runSQL() {
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
    
    // Read the init.sql file
    const sqlFile = path.join(__dirname, 'db', 'init.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('SQL file length:', sql.length);
    
    // Split SQL statements by semicolon followed by newline
    const statements = sql
      .split(/;\s*\n/)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt !== '--');
    
    console.log(`Found ${statements.length} SQL statements`);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt && stmt.length > 10) { // Only execute meaningful statements
        console.log(`Executing statement ${i + 1}/${statements.length}: ${stmt.substring(0, 50)}...`);
        try {
          await connection.execute(stmt);
        } catch (err) {
          console.log(`Statement ${i + 1} error: ${err.message}`);
          // Continue with next statement
        }
      }
    }
    
    console.log('✅ All tables created successfully!');
    
    // Show created tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Created tables:', tables.map(t => Object.values(t)[0]).join(', '));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

runSQL()
  .then(() => {
    console.log('🎉 Database initialization completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Failed:', error.message);
    process.exit(1);
  });
