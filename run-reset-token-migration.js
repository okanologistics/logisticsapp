require('dotenv').config();
const mysql = require('mysql2/promise');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.AZURE_MYSQL_HOST,
    user: process.env.AZURE_MYSQL_USER,
    password: process.env.AZURE_MYSQL_PASSWORD,
    database: process.env.AZURE_MYSQL_DATABASE,
    port: process.env.AZURE_MYSQL_PORT || 3306,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔧 Fixing reset_token column...');
    
    await connection.execute('ALTER TABLE users MODIFY COLUMN reset_token TEXT NULL');
    
    console.log('✅ reset_token column updated to TEXT successfully!');
    
    // Test with a sample JWT token
    const jwt = require('jsonwebtoken');
    const testToken = jwt.sign(
      { id: 'test', email: 'test@example.com', purpose: 'password-reset' },
      'test-secret',
      { expiresIn: '1h' }
    );
    
    console.log(`Token length: ${testToken.length} characters`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await connection.end();
  }
}

runMigration();
