import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session-token')?.value;

    if (!token) {
      return NextResponse.json({
        ok: false,
        error: 'No session token found'
      });
    }

    const { payload } = await jwtVerify(token, secret);
    console.log('Verifying admin token payload:', payload);

    if (!payload.id || !payload.email || !payload.role) {
      return NextResponse.json({
        ok: false,
        error: 'Invalid token payload'
      });
    }

    if (payload.role !== 'admin') {
      return NextResponse.json({
        ok: false,
        error: 'Not authorized - Admin access required'
      });
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: payload.id,
        email: payload.email,
        role: payload.role
      }
    });
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json({
      ok: false,
      error: 'Authentication failed'
    }, { status: 401 });
  }
}
