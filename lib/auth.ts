import { pool } from '@/lib/db';
import { verify, sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';

type AuthResult = {
  user: {
    id: string;
    email?: string;
  };
  profile: {
    role: string;
  };
};

export async function getServerSession(): Promise<AuthResult | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return null;
    }

    // Verify JWT token
    const decoded = verify(token, process.env.JWT_SECRET || 'default-secret') as {
      userId: string;
      email: string;
    };

    // Get user and profile from database
    const [users] = await pool.query(
      `SELECT u.*, p.role 
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = ?`,
      [decoded.userId]
    );

    const user = Array.isArray(users) ? users[0] : null;
    if (!user) {
      return null;
    }

    // Cast the MySQL result to an object with the expected properties
    const userData = user as {
      id: string;
      email: string;
      role?: string;
    };
    
    return {
      user: {
        id: userData.id,
        email: userData.email
      },
      profile: {
        role: userData.role || 'investor'
      }
    };
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

export async function checkAuth() {
  const session = await getServerSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  return session;
}

export async function checkInvestorAuth(): Promise<AuthResult> {
  const session = await getServerSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  if (session.profile.role !== 'investor') {
    throw new Error('Not authorized as investor');
  }

  return session;
}

export async function checkAdminAuth(): Promise<AuthResult> {
  const session = await getServerSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  if (session.profile.role !== 'admin') {
    throw new Error('Not authorized as admin');
  }

  return session;
}

// Token utilities for password reset and email verification
export async function createToken(payload: any): Promise<string> {
  return new Promise((resolve, reject) => {
    sign(payload, process.env.JWT_SECRET || 'default-secret', (err: Error | null, token: string | undefined) => {
      if (err) {
        reject(err);
      } else {
        resolve(token as string);
      }
    });
  });
}

export async function verifyToken(token: string): Promise<any> {
  return new Promise((resolve, reject) => {
    verify(token, process.env.JWT_SECRET || 'default-secret', (err: Error | null, decoded: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}
