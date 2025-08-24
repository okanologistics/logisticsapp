export const dynamic = "force-dynamic";
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    if (!payload.userId || !payload.email || !payload.role || payload.role !== 'admin') {
      redirect('/login');
    }

  } catch (error) {
    console.error('Error verifying admin token:', error);
    redirect('/login');
  }

  return <>{children}</>;
}
