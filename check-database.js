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
    
    console.log('✅ Connected! Checking existing schema...');
    
    // Get all tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('📋 Existing tables:', tables);
    
    // Check structure of each table
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`\n🔍 Structure of table '${tableName}':`);
      const [columns] = await connection.query(`DESCRIBE ${tableName}`);
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `(${col.Key})` : ''} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
      });
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

checkDatabase();
