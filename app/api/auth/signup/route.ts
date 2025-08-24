import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    await pool.execute(
      'INSERT INTO users (id, email, password, first_name, last_name, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [userId, email, hashedPassword, firstName, lastName]
    );

    // Create investor profile
    await pool.execute(
      'INSERT INTO profiles (id, user_id, role) VALUES (?, ?, ?)',
      [uuidv4(), userId, 'investor']
    );

    return NextResponse.json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}