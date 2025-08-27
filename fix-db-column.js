require('dotenv').config();

// Use the same database connection as the app
const { getPool } = require('./lib/db');

async function fixColumn() {
  const pool = getPool();
  
  try {
    console.log('🔧 Running migration to fix reset_token column...');
    
    // Check current column type
    const [describe] = await pool.query('DESCRIBE users');
    const resetTokenCol = describe.find(col => col.Field === 'reset_token');
    
    if (resetTokenCol) {
      console.log('Current reset_token type:', resetTokenCol.Type);
    }
    
    // Run the ALTER TABLE command
    await pool.execute('ALTER TABLE users MODIFY COLUMN reset_token TEXT NULL');
    
    console.log('✅ Successfully modified reset_token column to TEXT');
    
    // Verify the change
    const [newDescribe] = await pool.query('DESCRIBE users');
    const newResetTokenCol = newDescribe.find(col => col.Field === 'reset_token');
    
    if (newResetTokenCol) {
      console.log('New reset_token type:', newResetTokenCol.Type);
    }
    
    // Test JWT token length
    const jwt = require('jsonwebtoken');
    const testToken = jwt.sign(
      { id: 'test-user', email: 'test@example.com', purpose: 'password-reset' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );
    
    console.log('✅ Test JWT token length:', testToken.length, 'characters');
    console.log('This should now fit in the TEXT column.');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await pool.end();
    process.exit();
  }
}

fixColumn();
