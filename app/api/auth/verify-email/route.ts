import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
    }

    // Verify token
    const payload = await verifyToken(token);
    if (!payload || payload.purpose !== 'email-verification') {
      return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 });
    }

    // Update user's email verification status
    await pool.execute(
      'UPDATE users SET email_verified = true, email_verified_at = NOW() WHERE id = ?',
      [payload.id]
    );

    return NextResponse.json({ message: 'Email verified successfully' });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}
