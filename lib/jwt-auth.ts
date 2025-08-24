import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

export interface SessionPayload {
  id: string;
  email: string;
  role: string;
}

export async function verifyAuth(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    console.log('JWT payload:', payload);

    if (!payload.id || !payload.email || !payload.role ||
        !['admin', 'investor'].includes(String(payload.role))) {
      console.error('Invalid token payload:', payload);
      return null;
    }

    return {
      id: String(payload.id),
      email: String(payload.email),
      role: String(payload.role),
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}
