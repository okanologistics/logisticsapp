import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { fullName, phone, address } = await request.json();

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update investor profile
      await connection.execute(
        `UPDATE investors 
         SET full_name = ?, phone = ?, address = ?, updated_at = NOW()
         WHERE user_id = ?`,
        [fullName, phone, address, session.id]
      );

      await connection.commit();

      return NextResponse.json({
        message: 'Profile updated successfully',
        data: { fullName, phone, address }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
