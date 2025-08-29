require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function addProfileImageColumn() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: process.env.MYSQL_PORT || 3306
    });

    console.log('🔧 Connected to database');

    // Check if profile_image column already exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'profiles' AND COLUMN_NAME = 'profile_image'
    `, [process.env.MYSQL_DATABASE]);

    if (columns.length > 0) {
      console.log('✅ profile_image column already exists');
      await connection.end();
      return;
    }

    console.log('🔄 Adding profile_image column to profiles table...');
    
    // Add the profile_image column
    await connection.query(`
      ALTER TABLE profiles 
      ADD COLUMN profile_image VARCHAR(255) NULL AFTER phone_number
    `);

    console.log('✅ Successfully added profile_image column to profiles table');

    // Check the current table structure
    const [tableStructure] = await connection.query(`
      DESCRIBE profiles
    `);

    console.log('📊 Updated profiles table structure:');
    tableStructure.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    await connection.end();
    console.log('🎉 Database migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

addProfileImageColumn();
