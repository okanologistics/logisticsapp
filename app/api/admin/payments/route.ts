import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    // Get all payments with investor details
    const [payments] = await pool.query(`
      SELECT 
        p.*,
        i.full_name as investor_name,
        i.email as investor_email
      FROM payments p
      JOIN investors i ON p.investor_id = i.id
      ORDER BY p.payment_date DESC
    `);

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const connection = await pool.getConnection();
  try {
    const body = await request.json();
    await connection.beginTransaction();

    // Create payment record
    const paymentId = uuidv4();
    await connection.execute(
      `INSERT INTO payments (
        id,
        investor_id,
        amount,
        payment_type,
        payment_date,
        status,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        paymentId,
        body.investor_id,
        body.amount,
        body.payment_type,
        new Date(body.payment_date),
        body.status || 'pending',
        body.notes || null
      ]
    );

    // Update investor's interest_earned if this is a completed monthly return payment
    if (body.payment_type === 'monthly_return' && body.status === 'completed') {
      await connection.execute(
        `UPDATE investors 
         SET interest_earned = interest_earned + ?,
             last_payout_date = ?,
             next_payout_date = DATE_ADD(?, INTERVAL 1 MONTH)
         WHERE id = ?`,
        [body.amount, body.payment_date, body.payment_date, body.investor_id]
      );
    }

    await connection.commit();
    return NextResponse.json({ 
      message: 'Payment created successfully',
      id: paymentId
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
