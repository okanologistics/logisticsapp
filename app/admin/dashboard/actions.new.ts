'use server';

import { pool } from '@/lib/db';
import type { Investor, InvestorInput } from '@/types/database';
import { checkAdminAuth } from './auth';
import bcrypt from 'bcryptjs';
import type { RowDataPacket } from 'mysql2';

export interface DashboardStats {
  totalInvestment: number;
  totalInvestors: number;
  activeInvestors: number;
  totalBikes: number;
  monthlyReturns: number;
}

export interface InvestorDetails extends Investor {
  status: 'active' | 'pending' | 'inactive';
  returnRate: number;
  totalReturns: number;
  lastPayment: string | null;
  full_name: string;
  phone_number: string;
  total_investment: number;
  number_of_bikes: number;
  investment_date: string;
}

export async function getDashboardData(): Promise<{ stats: DashboardStats; investors: InvestorDetails[] }> {
  await checkAdminAuth();

  try {
    const [investors] = await pool.query<(InvestorDetails & RowDataPacket)[]>(`
      SELECT 
        i.*,
        p.full_name,
        p.phone_number,
        p.total_investment,
        p.number_of_bikes,
        p.return_rate,
        p.investment_date,
        p.status,
        (SELECT SUM(amount) FROM payments WHERE investor_id = i.id) as total_returns,
        (SELECT payment_date FROM payments WHERE investor_id = i.id ORDER BY payment_date DESC LIMIT 1) as last_payment
      FROM investors i
      LEFT JOIN profiles p ON i.id = p.investor_id
      ORDER BY p.investment_date DESC
    `);

    const stats: DashboardStats = {
      totalInvestors: investors.length,
      activeInvestors: investors.filter((i: InvestorDetails) => i.status === 'active').length,
      totalInvestment: investors.reduce((sum: number, i: InvestorDetails) => sum + (i.total_investment || 0), 0),
      totalBikes: investors.reduce((sum: number, i: InvestorDetails) => sum + (i.number_of_bikes || 0), 0),
      monthlyReturns: investors.reduce((sum: number, i: InvestorDetails) => sum + (i.returnRate || 0), 0)
    };

    return { stats, investors };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw new Error('Failed to fetch dashboard data');
  }
}

export async function updateInvestorStatus(id: string, status: string): Promise<{ success: boolean }> {
  await checkAdminAuth();

  try {
    await pool.query(
      'UPDATE profiles SET status = ? WHERE investor_id = ?',
      [status, id]
    );
    return { success: true };
  } catch (error) {
    console.error('Error updating investor status:', error);
    throw new Error('Failed to update investor status');
  }
}

export async function createInvestor(data: InvestorInput): Promise<{ success: boolean; id: string }> {
  await checkAdminAuth();

  if (!data.email || !data.password || !data.full_name) {
    throw new Error('Email, password, and full name are required');
  }

  if (!data.total_investment || !data.number_of_bikes) {
    throw new Error('Investment details are required');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert into investors table
      const [result] = await connection.query<any>(
        'INSERT INTO investors (email, password) VALUES (?, ?)',
        [data.email, hashedPassword]
      );

      const investorId = result.insertId;

      // Calculate return rate (5% of total investment)
      const monthlyReturn = (data.total_investment * 0.05);

      // Insert into profiles table
      await connection.query(
        `INSERT INTO profiles (
          investor_id, full_name, phone_number, 
          total_investment, number_of_bikes, return_rate,
          investment_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), 'active')`,
        [
          investorId,
          data.full_name,
          data.phone_number || '',
          data.total_investment,
          data.number_of_bikes,
          monthlyReturn
        ]
      );

      await connection.commit();
      return { success: true, id: investorId.toString() };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating investor:', error);
    throw new Error('Failed to create investor');
  }
}

export async function getInvestorDetails(id: string): Promise<InvestorDetails> {
  await checkAdminAuth();

  try {
    const [rows] = await pool.query<(InvestorDetails & RowDataPacket)[]>(
      `SELECT 
        i.*,
        p.full_name,
        p.phone_number,
        p.total_investment,
        p.number_of_bikes,
        p.return_rate,
        p.investment_date,
        p.status,
        (SELECT SUM(amount) FROM payments WHERE investor_id = i.id) as total_returns,
        (SELECT payment_date FROM payments WHERE investor_id = i.id ORDER BY payment_date DESC LIMIT 1) as last_payment
      FROM investors i
      LEFT JOIN profiles p ON i.id = p.investor_id
      WHERE i.id = ?`,
      [id]
    );

    if (!rows[0]) {
      throw new Error('Investor not found');
    }

    return rows[0];
  } catch (error) {
    console.error('Error fetching investor details:', error);
    throw new Error('Failed to fetch investor details');
  }
}
