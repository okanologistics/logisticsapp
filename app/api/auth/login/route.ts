import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret'
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    console.log('Login attempt for:', email);

    // Check if database is configured
    if (!process.env.MYSQL_HOST || process.env.MYSQL_HOST === 'localhost') {
      console.error('Database not configured for production environment');
      return NextResponse.json(
        { 
          error: 'Database not configured', 
          message: 'Please set up cloud database credentials',
          debug: {
            env: process.env.NODE_ENV,
            host: process.env.MYSQL_HOST || 'not set'
          }
        },
        { status: 500 }
      );
    }

    // Get user from database
    let user;
    try {
      console.log('Database connection successful');
      user = await db.findUserByEmail(email);
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { 
          error: 'Database connection error',
          message: dbError.message || 'Failed to connect to database',
          debug: {
            code: dbError.code,
            errno: dbError.errno,
            host: process.env.MYSQL_HOST
          }
        },
        { status: 500 }
      );
    }

    if (!user) {
      console.log('No user found for email:', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // If user has no profile, create one with default role 'investor'
    if (!user.role) {
      await db.createProfile(user.id, 'investor');
    }

    // Create JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role || 'investor'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    // Create response object
    const responseData = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      redirectTo: user.role === 'admin' ? '/admin/dashboard' : '/dashboard'
    };

    // Create response with user data
    const response = NextResponse.json(responseData);

    // Set the auth token as an HTTP-only cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    console.log('Login successful:', { 
      user: responseData.user,
      redirectTo: responseData.redirectTo
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'An error occurred during login',
        message: 'Login failed',
        debug: {
          stack: error.stack,
          name: error.name
        }
      },
      { status: 500 }
    );
  }
}
