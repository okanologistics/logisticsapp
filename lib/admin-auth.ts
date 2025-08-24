import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function getAdminAuth() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session-token')?.value;

    if (!token) {
      console.error('No session token found');
      return {
        ok: false,
        session: null,
        user: null,
        error: 'No session token found'
      };
    }

    const { payload } = await jwtVerify(token, secret);

    if (!payload.id || !payload.email || !payload.role) {
      console.error('Invalid token payload:', payload);
      return {
        ok: false,
        session: null,
        user: null,
        error: 'Invalid token payload'
      };
    }

    if (payload.role !== 'admin') {
      console.error('User is not an admin. Role:', payload.role);
      return {
        ok: false,
        session: null,
        user: null,
        error: 'Not authorized - Admin access required'
      };
    }

    return {
      ok: true,
      session: {
        user: {
          id: payload.id as string,
          email: payload.email as string,
          role: payload.role as string
        }
      },
      user: {
        id: payload.id as string,
        email: payload.email as string,
        role: payload.role as string
      },
      error: null
    };
  } catch (error) {
    console.error('Auth error:', error);
    return {
      ok: false,
      session: null,
      user: null,
      error: error instanceof Error ? error.message : 'Authentication failed'
    };
  }
}
