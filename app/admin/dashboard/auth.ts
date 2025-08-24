'use server';

import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret'
);

export async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    console.error('No auth token found');
    throw new Error('Not authenticated');
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    console.log('Verifying admin token payload:', payload);

    if (!payload.userId || !payload.email || !payload.role) {
      console.error('Invalid token payload:', payload);
      throw new Error('Not authenticated');
    }

    if (payload.role !== 'admin') {
      console.error('User is not an admin. Role:', payload.role);
      throw new Error('Not authorized - Admin access required');
    }

    return {
      user: {
        id: payload.userId as string,
        email: payload.email as string,
        role: payload.role as string
      }
    };
  } catch (error) {
    console.error('Error verifying admin token:', error);
    throw new Error('Authentication failed');
  }
}
