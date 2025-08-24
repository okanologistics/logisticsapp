import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import mysql from 'mysql2/promise';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import type { InvestorInput } from '@/types/database';

// Create database pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret'
);

export async function POST(request: Request) {
  try {
    // Verify admin authorization
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No auth token' },
        { status: 401 }
      );
    }

    let isAdmin = false;
    try {
      const { payload } = await jwtVerify(token, secret);
      isAdmin = payload.role === 'admin';
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const investorData: InvestorInput = await request.json();
    
    // Validate required fields
    if (!investorData.email || !investorData.full_name || !investorData.phone_number) {
      return NextResponse.json(
        { error: 'Missing required fields: email, full_name, or phone_number' },
        { status: 400 }
      );
    }

    // Check if investor already exists
    const [existingInvestor] = await pool.execute(
      'SELECT id FROM investors WHERE email = ?',
      [investorData.email]
    );

    if ((existingInvestor as any[]).length > 0) {
      return NextResponse.json(
        { error: 'Investor with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password if provided, or create a default one
    let hashedPassword;
    if (investorData.password) {
      hashedPassword = await hash(investorData.password, 12);
    } else {
      // Create a default password from email
      const defaultPassword = investorData.email.split('@')[0] + '123';
      hashedPassword = await hash(defaultPassword, 12);
    }

    // Generate user ID
    const userId = uuidv4();

    // Calculate ROI: Total payout = Capital + 25% profit
    const totalProfit = investorData.total_investment * 0.25;
    const totalPayout = investorData.total_investment + totalProfit;
    
    // Monthly payout = (Capital + Profit) / 12 months
    const monthlyReturn = totalPayout / 12;
    
    // Weekly payout = (Capital + Profit) / 52 weeks  
    const weeklyReturn = totalPayout / 52;

    // Set investment and maturity dates
    const investmentDate = investorData.investment_date || new Date().toISOString().split('T')[0];
    const maturityDate = new Date(investmentDate);
    maturityDate.setMonth(maturityDate.getMonth() + 12); // Default 12 months maturity

    // Set next payout date to one month from investment date
    const nextPayoutDate = new Date(investmentDate);
    nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1);

    // Start a transaction
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Create user record
      await connection.execute(
        `INSERT INTO users (id, email, password, created_at, updated_at) 
         VALUES (?, ?, ?, NOW(), NOW())`,
        [userId, investorData.email, hashedPassword]
      );

      // 2. Create profile record
      await connection.execute(
        `INSERT INTO profiles (id, user_id, role, created_at, updated_at) 
         VALUES (?, ?, 'investor', NOW(), NOW())`,
        [uuidv4(), userId]
      );

      // 3. Create investment_details record  
      const investorResult = await connection.execute(
        `INSERT INTO investment_details (
          id, investor_id, total_investment, number_of_bikes,
          monthly_return, investment_date, maturity_date, 
          next_payout_date, investment_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          uuidv4(),
          userId,
          investorData.total_investment,
          investorData.number_of_bikes,
          monthlyReturn,
          investmentDate,
          maturityDate.toISOString().split('T')[0],
          nextPayoutDate.toISOString().split('T')[0],
          investorData.status || 'active'
        ]
      );

      await connection.commit();
      
      // Return success response with basic investor data
      return NextResponse.json({
        success: true,
        message: 'Investor created successfully',
        investor: {
          id: userId,
          email: investorData.email,
          full_name: investorData.full_name
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error creating investor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
