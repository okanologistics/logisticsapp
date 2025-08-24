import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    console.log('Database connection test starting...');
    
    // Check if environment variables are set
    const envCheck = {
      MYSQL_HOST: !!process.env.MYSQL_HOST,
      MYSQL_USER: !!process.env.MYSQL_USER, 
      MYSQL_PASSWORD: !!process.env.MYSQL_PASSWORD,
      MYSQL_DATABASE: !!process.env.MYSQL_DATABASE,
      JWT_SECRET: !!process.env.JWT_SECRET,
      NODE_ENV: process.env.NODE_ENV
    };

    console.log('Environment variables check:', envCheck);

    // If no database config, return early
    if (!process.env.MYSQL_HOST || process.env.MYSQL_HOST === 'localhost') {
      return NextResponse.json({
        success: false,
        error: 'Database not configured for production',
        message: 'Please set up cloud database credentials in Vercel environment variables',
        envCheck,
        host: process.env.MYSQL_HOST || 'not set'
      });
    }

    // Test database connection
    console.log('Testing database connection...');
    const connection = await pool.getConnection();
    
    // Test query
    const [result] = await connection.query('SELECT 1 as test');
    console.log('Database test query result:', result);
    
    // Check tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Available tables:', tables);
    
    connection.release();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      envCheck,
      tablesCount: tables.length,
      tables: tables.map((table: any) => Object.values(table)[0])
    });

  } catch (error) {
    console.error('Database connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Database connection failed',
      envCheck: {
        MYSQL_HOST: !!process.env.MYSQL_HOST,
        MYSQL_USER: !!process.env.MYSQL_USER, 
        MYSQL_PASSWORD: !!process.env.MYSQL_PASSWORD,
        MYSQL_DATABASE: !!process.env.MYSQL_DATABASE,
        host: process.env.MYSQL_HOST || 'not set'
      }
    }, { status: 500 });
  }
}
