import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { checkAdminAuth } from '@/app/admin/dashboard/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await checkAdminAuth();
    
    const resolvedParams = await params;
    const [payments] = await pool.query(
      `SELECT 
        id,
        amount,
        payment_date,
        payment_type,
        status,
        notes,
        created_at
      FROM payments 
      WHERE investor_id = ? 
      ORDER BY payment_date DESC`,
      [resolvedParams.id]
    );

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching investor payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await checkAdminAuth();
    
    const resolvedParams = await params;
    const body = await request.json();
    
    const [result] = await pool.query<any>(
      `INSERT INTO payments (
        investor_id, amount, payment_type, payment_date, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        resolvedParams.id,
        body.amount,
        body.payment_type,
        body.payment_date || new Date().toISOString().split('T')[0],
        body.status || 'completed',
        body.notes || ''
      ]
    );

    return NextResponse.json({ 
      success: true, 
      id: result.insertId.toString() 
    });
  } catch (error) {
    console.error('Error adding payment record:', error);
    return NextResponse.json(
      { error: 'Failed to add payment record' },
      { status: 500 }
    );
  }
}
