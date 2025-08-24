import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    // Hash password
    const password = await bcrypt.hash('admin123', 10);

    // Create admin user
    const [result]: any = await pool.execute(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      ['samuelekelejnr@gmail.com', password]
    );

    if (!result.insertId) {
      throw new Error('Failed to create user');
    }

    // Create admin profile
    await pool.execute(
      'INSERT INTO profiles (user_id, role) VALUES (?, ?)',
      [result.insertId, 'admin']
    );

    return NextResponse.json({ 
      message: 'Admin user created successfully',
      email: 'samuelekelejnr@gmail.com',
      password: 'admin123'
    });
  } catch (error: any) {
    console.error('Setup error:', error);

    // Check if it's a duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({
        error: 'Admin user already exists'
      }, { status: 409 });
    }

    return NextResponse.json({ 
      error: 'Failed to create admin user',
      details: error.message
    }, { status: 500 });
  }
}
