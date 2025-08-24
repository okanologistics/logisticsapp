import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret'
);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ ok: false, error: 'No session found' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);

    if (!payload.userId || !payload.email || !payload.role) {
      return NextResponse.json({ ok: false, error: 'Invalid session' }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role
      }
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ ok: false, error: 'Invalid session' }, { status: 401 });
  }
}
