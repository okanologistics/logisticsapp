import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Clear the auth_token cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
