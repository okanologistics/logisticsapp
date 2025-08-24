import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sign } from 'jsonwebtoken';
import { PoolConnection, ResultSetHeader } from 'mysql2/promise';

interface RegistrationBody {
  email: string;
  password: string;
  full_name: string;
  phone_number: string | null;
  total_investment: number;
  number_of_bikes: number;
  monthly_return: number;
}

async function createUserWithProfile(
  connection: PoolConnection,
  userId: string,
  data: RegistrationBody,
  hashedPassword: string,
): Promise<void> {
  // Create user first
  await connection.execute<ResultSetHeader>(
    `INSERT INTO users (id, email, password) VALUES (?, ?, ?)`,
    [userId, data.email, hashedPassword]
  );

  // Create profile with role
  await connection.execute<ResultSetHeader>(
    `INSERT INTO profiles (id, user_id, role) VALUES (?, ?, ?)`,
    [uuidv4(), userId, 'investor']
  );

  // Create investor record with basic details
  const investorId = uuidv4();
  await connection.execute<ResultSetHeader>(
    `INSERT INTO investors (
      id,
      user_id,
      full_name,
      phone
    ) VALUES (?, ?, ?, ?)`,
    [
      investorId,
      userId,
      data.full_name,
      data.phone_number || null
    ]
  );

  // Calculate dates for investment details
  const maturityDate = new Date();
  maturityDate.setFullYear(maturityDate.getFullYear() + 1);
  const formattedMaturityDate = maturityDate.toISOString().slice(0, 19).replace('T', ' ');

  const nextPayoutDate = new Date();
  nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1);
  const formattedNextPayoutDate = nextPayoutDate.toISOString().slice(0, 19).replace('T', ' ');

  // Create investment details record
  await connection.execute<ResultSetHeader>(
    `INSERT INTO investment_details (
      id,
      investor_id,
      total_investment,
      number_of_bikes,
      monthly_return,
      maturity_date,
      next_payout_date,
      investment_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      uuidv4(),
      investorId,
      data.total_investment,
      data.number_of_bikes,
      data.monthly_return,
      formattedMaturityDate,
      formattedNextPayoutDate,
      'active'
    ]
  );


}

export const POST = async (request: NextRequest) => {
  let connection: PoolConnection | null = null;

  try {
    // Parse request body
    const body: RegistrationBody = await request.json();

    // Basic validation
    if (!body.email || !body.password || !body.full_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Hash password and generate user ID
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const userId = uuidv4();

    // Get database connection and start transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Create all records within transaction
    await createUserWithProfile(connection, userId, body, hashedPassword);
    await connection.commit();

    // Generate JWT token
    const token = sign(
      { userId, email: body.email, role: 'investor' },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    // Return success response with token
    return NextResponse.json({
      id: userId,
      token,
      message: 'Registration successful'
    });

  } catch (error: any) {
    // Rollback transaction if it was started
    if (connection) {
      await connection.rollback();
    }

    console.error('Registration error:', error);

    return NextResponse.json(
      { 
        error: 'Registration failed',
        details: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    );

  } finally {
    // Release database connection
    if (connection) {
      connection.release();
    }
  }
}
