import { NextResponse } from 'next/server';
import { checkAdminAuth } from '@/app/admin/dashboard/auth';
import { pool } from '@/lib/db';
import type { Investor } from '@/types/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function PUT(request: Request) {
  try {
    // This will throw if user is not admin
    await checkAdminAuth();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Investor ID is required' }, { status: 400 });
    }

    const data = await request.json();

    // Calculate new monthly return if investment amount changed
    if (data.total_investment) {
      data.monthly_return = (data.total_investment * 0.25) / 12;
    }

    // Update investor in MySQL
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    // Build dynamic query based on provided fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    });
    
    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    
    updateValues.push(id); // Add ID for WHERE clause
    
    const updateQuery = `
      UPDATE investors 
      SET ${updateFields.join(', ')}, updated_at = NOW() 
      WHERE id = ?
    `;
    
    await pool.query<ResultSetHeader>(updateQuery, updateValues);

    // Fetch updated investor
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM investors WHERE id = ?',
      [id]
    );
    
    const updatedInvestor = rows[0] as Investor;

    return NextResponse.json({ 
      success: true, 
      investor: updatedInvestor 
    });

  } catch (error: any) {
    console.error('Update investor error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update investor' 
    }, { status: 500 });
  }
}
