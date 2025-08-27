require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixResetTokenColumn() {
  const pool = mysql.createPool({
    host: process.env.AZURE_MYSQL_HOST,
    user: process.env.AZURE_MYSQL_USER,
    password: process.env.AZURE_MYSQL_PASSWORD,
    database: process.env.AZURE_MYSQL_DATABASE,
    port: process.env.AZURE_MYSQL_PORT || 3306,
    ssl: { rejectUnauthorized: false },
    connectionLimit: 10
  });

  try {
    console.log('🔍 Checking current reset_token column definition...');
    
    // Check current column definition
    const [columns] = await pool.query(
      'SHOW COLUMNS FROM users WHERE Field = "reset_token"'
    );
    
    if (columns.length > 0) {
      console.log('Current reset_token column:', columns[0]);
      console.log('Current type:', columns[0].Type);
      
      if (columns[0].Type === 'varchar(255)') {
        console.log('🔧 Expanding reset_token column from VARCHAR(255) to TEXT...');
        
        await pool.execute(
          'ALTER TABLE users MODIFY COLUMN reset_token TEXT NULL'
        );
        
        console.log('✅ Successfully expanded reset_token column to TEXT');
        
        // Verify the change
        const [updatedColumns] = await pool.query(
          'SHOW COLUMNS FROM users WHERE Field = "reset_token"'
        );
        console.log('Updated column:', updatedColumns[0]);
        console.log('New type:', updatedColumns[0].Type);
      } else {
        console.log('ℹ️ Column already has sufficient size:', columns[0].Type);
      }
    } else {
      console.log('❌ reset_token column not found. Adding it...');
      
      await pool.execute(`
        ALTER TABLE users 
        ADD COLUMN reset_token TEXT NULL,
        ADD COLUMN reset_token_expires TIMESTAMP NULL
      `);
      
      console.log('✅ Added reset_token and reset_token_expires columns');
    }
    
    // Test JWT token size
    const jwt = require('jsonwebtoken');
    const testToken = jwt.sign(
      { id: 'test-user-id', email: 'test@example.com', purpose: 'password-reset' },
      process.env.JWT_SECRET || 'test-secret-key',
      { expiresIn: '1h' }
    );
    
    console.log('\n📏 JWT Token Analysis:');
    console.log('Token length:', testToken.length);
    console.log('Sample token (first 100 chars):', testToken.substring(0, 100) + '...');
    
    if (testToken.length > 255) {
      console.log('⚠️ Token is longer than 255 characters - TEXT column was necessary');
    } else {
      console.log('ℹ️ Token fits in 255 characters, but TEXT provides better flexibility');
    }
    
  } catch (error) {
    console.error('❌ Error fixing reset_token column:', error);
  } finally {
    await pool.end();
    console.log('🔚 Database connection closed');
  }
}

fixResetTokenColumn().catch(console.error);
