'use server';

import { pool } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { checkAdminAuth } from './auth';

export interface DashboardStats {
  totalInvestors: number;
  activeInvestors: number;
  totalBikes: number;
  totalInvestment: number;
  monthlyReturns: number;
}

export interface InvestorDetails {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone_number: string;
  total_investment: number;
  number_of_bikes: number;
  monthly_return: number;
  investment_date: string;
  investment_status: 'active' | 'inactive';
  created_at: string;
}

export async function getAdminDashboardData() {
  await checkAdminAuth();

  const connection = await pool.getConnection();
  
  try {
    // Get investors summary
    const [stats] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as totalInvestors,
        SUM(CASE WHEN investment_status = 'active' THEN 1 ELSE 0 END) as activeInvestors,
        SUM(number_of_bikes) as totalBikes,
        SUM(total_investment) as totalInvestment,
        SUM(monthly_return) as monthlyReturns
       FROM profiles
       WHERE role = 'investor'`
    );

    // Get detailed investor list
    const [investors] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        p.id,
        p.user_id,
        u.email,
        p.full_name,
        p.phone_number,
        p.total_investment,
        p.number_of_bikes,
        p.monthly_return,
        p.investment_date,
        p.investment_status,
        p.created_at
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.role = 'investor'
       ORDER BY p.created_at DESC`
    );

    return {
      stats: stats[0] as DashboardStats,
      investors: investors as InvestorDetails[]
    };
  } finally {
    connection.release();
  }
}

export async function getInvestorDetails(id: string) {
  await checkAdminAuth();

  const connection = await pool.getConnection();
  
  try {
    // Get investor details
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        p.id,
        p.user_id,
        u.email,
        p.full_name,
        p.phone_number,
        p.total_investment,
        p.number_of_bikes,
        p.monthly_return,
        p.investment_date,
        p.investment_status,
        p.created_at,
        p.avatar_url
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ? AND p.role = 'investor'`,
      [id]
    );

    if (!rows[0]) {
      throw new Error('Investor not found');
    }

    // Get payment history
    const [payments] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC`,
      [rows[0].user_id]
    );

    return {
      investor: rows[0] as InvestorDetails,
      payments
    };
  } finally {
    connection.release();
  }
}
