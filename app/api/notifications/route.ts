import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { RowDataPacket } from 'mysql2';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret');

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    // Get notifications for the user
    const [notifications] = await pool.query<RowDataPacket[]>(
      `SELECT 
        id, 
        message, 
        type, 
        read_at,
        created_at 
      FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50`,
      [userId]
    );

    return NextResponse.json({ 
      success: true, 
      notifications: notifications || [] 
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch notifications' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    const { notificationId } = await request.json();

    // Mark notification as read
    await pool.query(
      `UPDATE notifications 
       SET read_at = NOW() 
       WHERE id = ? AND user_id = ?`,
      [notificationId, userId]
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to mark notification as read' 
    }, { status: 500 });
  }
}
