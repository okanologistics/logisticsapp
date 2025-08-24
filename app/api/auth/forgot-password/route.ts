import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { createToken } from '@/lib/auth';
import { sendEmail, generatePasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (!Array.isArray(users) || users.length === 0) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json({ message: 'If an account exists, a password reset email will be sent' });
    }

    const user = users[0] as { id: string };

    // Generate reset token
    const resetToken = await createToken({
      id: user.id,
      email,
      purpose: 'password-reset',
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiry
    });

    // Store reset token in database
    await pool.execute(
      'UPDATE users SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?',
      [resetToken, user.id]
    );

    // Send reset email
    await sendEmail({
      to: email,
      subject: 'Reset your password',
      html: generatePasswordResetEmail(resetToken)
    });

    return NextResponse.json({
      message: 'If an account exists, a password reset email will be sent'
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
