import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const [investors] = await pool.query(`
      SELECT 
        i.id,
        i.full_name,
        i.email,
        i.phone_number,
        i.total_investment,
        i.number_of_bikes,
        i.status,
        i.investment_date,
        i.maturity_date,
        i.notes
      FROM investors i
      ORDER BY i.created_at DESC
    `);

    return NextResponse.json(investors);
  } catch (error) {
    console.error('Error fetching investors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create investor record
      const [result] = await connection.query(
        `INSERT INTO investors (
          full_name,
          email,
          phone_number,
          total_investment,
          number_of_bikes,
          investment_date,
          status,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          body.full_name,
          body.email,
          body.phone_number,
          body.total_investment,
          body.number_of_bikes,
          body.investment_date,
          body.status || 'active',
          body.notes || null
        ]
      );

      await connection.commit();
      return NextResponse.json({ message: 'Investor created successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating investor:', error);
    return NextResponse.json(
      { error: 'Failed to create investor' },
      { status: 500 }
    );
  }
}
