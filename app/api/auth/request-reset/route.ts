import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { sign } from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const [users]: any = await pool.execute(
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    );

    if (!users.length) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    const user = users[0];

    // Generate reset token
    const resetToken = sign(
      { id: user.id, email: user.email, purpose: 'password-reset' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // Save reset token in database
    await pool.execute(
      'UPDATE users SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?',
      [resetToken, user.id]
    );

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@okanologistics.com',
      to: email,
      subject: 'Password Reset Request - Okano Logistics',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a365d;">Password Reset Request</h2>
          <p>You requested a password reset for your Okano Logistics account.</p>
          <p>Click the button below to reset your password. This link is valid for 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Reset Password</a>
          <p style="color: #64748b; font-size: 14px;">If you didn't request this reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #64748b; font-size: 12px;">Okano Logistics</p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "Password reset email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}
