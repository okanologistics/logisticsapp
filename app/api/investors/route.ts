import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Check admin authorization
    await checkAdminAuth();

    // Get all investors
    const [investors] = await pool.execute(
      `SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.address,
        u.created_at,
        p.role,
        COALESCE(SUM(id.investment_amount), 0) as total_invested,
        COUNT(id.id) as investment_count
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       LEFT JOIN investment_details id ON id.user_id = u.id
       WHERE p.role = 'investor'
       GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.address, u.created_at, p.role
       ORDER BY u.created_at DESC`
    );

    return NextResponse.json({ investors });
  } catch (error) {
    console.error('Get investors error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Not authenticated') {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }
      if (error.message === 'Not authorized as admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }
    }

    return NextResponse.json({ error: 'Failed to fetch investors' }, { status: 500 });
  }
}