import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const [investors] = await pool.query(
      `SELECT * FROM investors WHERE id = ?`,
      [resolvedParams.id]
    );

    const investor = Array.isArray(investors) ? investors[0] : null;
    if (!investor) {
      return NextResponse.json(
        { error: 'Investor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(investor);
  } catch (error) {
    console.error('Error fetching investor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const connection = await pool.getConnection();
  try {
    const resolvedParams = await params;
    const body = await request.json();
    await connection.beginTransaction();

    // Update investor record
    await connection.execute(
      `UPDATE investors SET
        full_name = ?,
        email = ?,
        phone_number = ?,
        total_investment = ?,
        number_of_bikes = ?,
        monthly_return = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        body.full_name,
        body.email,
        body.phone_number,
        body.total_investment,
        body.number_of_bikes,
        body.monthly_return,
        body.status,
        resolvedParams.id
      ]
    );

    await connection.commit();
    return NextResponse.json({ message: 'Investor updated successfully' });

  } catch (error) {
    await connection.rollback();
    console.error('Error updating investor:', error);
    return NextResponse.json(
      { error: 'Failed to update investor' },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const connection = await pool.getConnection();
  try {
    const resolvedParams = await params;
    await connection.beginTransaction();

    // Delete the investor (cascading delete will handle related records)
    await connection.execute(
      'DELETE FROM investors WHERE id = ?',
      [resolvedParams.id]
    );

    await connection.commit();
    return NextResponse.json({ message: 'Investor deleted successfully' });

  } catch (error) {
    await connection.rollback();
    console.error('Error deleting investor:', error);
    return NextResponse.json(
      { error: 'Failed to delete investor' },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
