import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { checkAdminAuth } from '@/app/admin/dashboard/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await checkAdminAuth();
    
    const resolvedParams = await params;
    const body = await request.json();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];

      if (body.total_investment !== undefined) {
        updateFields.push('total_investment = ?');
        updateValues.push(body.total_investment);
      }

      if (body.number_of_bikes !== undefined) {
        updateFields.push('number_of_bikes = ?');
        updateValues.push(body.number_of_bikes);
      }

      if (body.monthly_return !== undefined) {
        updateFields.push('monthly_return = ?');
        updateValues.push(body.monthly_return);
      } else if (body.total_investment !== undefined) {
        // Recalculate monthly return based on 25% annual return distributed over 12 months
        // Monthly payout = (Capital + 25% profit) / 12
        const totalPayout = body.total_investment * 1.25; // Capital + 25% profit
        const monthlyReturn = totalPayout / 12;
        updateFields.push('monthly_return = ?');
        updateValues.push(monthlyReturn);
      }

      if (body.investment_status !== undefined) {
        updateFields.push('investment_status = ?');
        updateValues.push(body.investment_status);
      }

      if (body.maturity_date !== undefined) {
        updateFields.push('maturity_date = ?');
        updateValues.push(body.maturity_date);
      }

      if (body.next_payout_date !== undefined) {
        updateFields.push('next_payout_date = ?');
        updateValues.push(body.next_payout_date);
      }

      if (updateFields.length > 0) {
        updateValues.push(resolvedParams.id);
        
        await connection.query(
          `UPDATE investment_details SET ${updateFields.join(', ')} WHERE investor_id = ?`,
          updateValues
        );
      }

      await connection.commit();
      return NextResponse.json({ success: true });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating investment details:', error);
    return NextResponse.json(
      { error: 'Failed to update investment details' },
      { status: 500 }
    );
  }
}
