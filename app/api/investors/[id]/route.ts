import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const connection = await pool.getConnection();

  try {
    // Get investor details
    const [investors] = await connection.execute(
      `SELECT 
        i.id,
        i.user_id,
        i.full_name,
        i.phone,
        i.status,
        i.created_at,
        i.updated_at
      FROM investors i
      WHERE i.id = ?`,
      [id]
    );

    if (!Array.isArray(investors) || investors.length === 0) {
      return NextResponse.json(
        { error: 'Investor not found' },
        { status: 404 }
      );
    }

    // Get related payments
    const [payments] = await connection.execute(
      `SELECT 
        id,
        amount,
        payment_date,
        status,
        investor_id
      FROM payments
      WHERE investor_id = ?
      ORDER BY payment_date DESC`,
      [id]
    );

    return NextResponse.json({
      investor: investors[0],
      payments: payments || []
    });

  } catch (error: any) {
    console.error('Error fetching investor details:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch investor details',
        details: error.message
      },
      { status: 500 }
    );

  } finally {
    connection.release();
  }
}
