const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    // Database configuration from environment variables
    const dbConfig = {
      host: process.env.MYSQL_HOST || "localhost",
      user: process.env.MYSQL_USER || "root", 
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "okanodb",
      multipleStatements: true
    };

    console.log('Connecting to database...');
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('Connected! Running migration...');
    
    // Read and execute the migration SQL
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'db', 'update-investors-schema.sql'), 
      'utf8'
    );
    
    await connection.execute(migrationSQL);
    console.log('✅ Migration completed successfully!');
    
    // Test the updated schema by fetching investors
    const [investors] = await connection.query('SELECT * FROM investors LIMIT 5');
    console.log('📊 Sample investor data:', investors);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
