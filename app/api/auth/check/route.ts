import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'your-secret-key';

interface SessionPayload {
  id: string;
  email: string;
  role: string;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session-token');

    if (!token) {
      return NextResponse.json({ 
        ok: false,
        error: 'No session found' 
      }, { status: 401 });
    }

    const payload = verify(token.value, secret) as SessionPayload;

    return NextResponse.json({
      ok: true,
      session: {
        user: {
          id: payload.id,
          email: payload.email,
        },
        role: payload.role
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      ok: false,
      error: 'Invalid session'
    }, { status: 401 });
  }
}
