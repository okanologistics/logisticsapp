'use server';

import { pool } from '@/lib/db';
import type { Investor, InvestorInput } from '@/types/database';
import { checkAdminAuth } from './auth';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import type { RowDataPacket } from 'mysql2';
import { sendPaymentNotificationEmail } from '@/lib/email';

export interface DashboardStats {
  totalInvestment: number;
  totalInvestors: number;
  activeInvestors: number;
  totalBikes: number;
  monthlyReturns: number;
}

export interface InvestorDetails {
  id: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  return_rate: number;
  monthly_return: number;
  total_returns: number;
  last_payment: string | null;
  full_name: string;
  phone_number: string;
  total_investment: number;
  number_of_bikes: number;
  investment_date: string;
  maturity_date?: string;
  next_payout_date?: string;
}

export async function getDashboardData(): Promise<{ stats: DashboardStats; investors: InvestorDetails[] }> {
  await checkAdminAuth();

  try {
    // Now get the combined data
    const [investors] = await pool.query<(InvestorDetails & RowDataPacket)[]>(`
      SELECT 
        u.id,
        u.email,
        p.role,
        p.full_name,
        COALESCE(p.phone_number, '') as phone_number,
        CAST(COALESCE(inv.total_investment, 0) AS DECIMAL(15,2)) as total_investment,
        CAST(COALESCE(inv.number_of_bikes, 0) AS UNSIGNED) as number_of_bikes,
        CAST(COALESCE(inv.monthly_return, 0) AS DECIMAL(15,2)) as return_rate,
        CAST(COALESCE(inv.monthly_return, 0) AS DECIMAL(15,2)) as monthly_return,
        DATE_FORMAT(COALESCE(inv.investment_date, NOW()), '%Y-%m-%d') as investment_date,
        DATE_FORMAT(inv.maturity_date, '%Y-%m-%d') as maturity_date,
        DATE_FORMAT(inv.next_payout_date, '%Y-%m-%d') as next_payout_date,
        COALESCE(inv.investment_status, 'pending') as status,
        CAST(COALESCE((SELECT SUM(amount) FROM payments WHERE investor_id COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci), 0) AS DECIMAL(15,2)) as total_returns,
        (SELECT DATE_FORMAT(payment_date, '%Y-%m-%d') FROM payments WHERE investor_id COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci ORDER BY payment_date DESC LIMIT 1) as last_payment
      FROM users u
      LEFT JOIN profiles p ON u.id COLLATE utf8mb4_unicode_ci = p.user_id COLLATE utf8mb4_unicode_ci
      LEFT JOIN investment_details inv ON u.id COLLATE utf8mb4_unicode_ci = inv.investor_id COLLATE utf8mb4_unicode_ci
      WHERE p.role = 'investor'
      ORDER BY COALESCE(inv.investment_date, '1970-01-01') DESC
    `);
    
    console.log('Found investors:', investors?.length || 0);
    console.log('Sample investor data:', investors[0]);

    const stats: DashboardStats = {
      totalInvestors: investors.length,
      activeInvestors: investors.filter((i: InvestorDetails) => i.status === 'active').length,
      totalInvestment: investors.reduce((sum: number, i: InvestorDetails) => sum + (Number(i.total_investment) || 0), 0),
      totalBikes: investors.reduce((sum: number, i: InvestorDetails) => sum + (Number(i.number_of_bikes) || 0), 0),
      monthlyReturns: investors.reduce((sum: number, i: InvestorDetails) => sum + (Number(i.return_rate) || 0), 0)
    };

    console.log('Calculated stats:', stats);

    return { stats, investors };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw new Error('Failed to fetch dashboard data');
  }
}

export async function updateInvestorStatus(id: string, status: string): Promise<{ success: boolean }> {
  await checkAdminAuth();

  console.log('🔄 Server updateInvestorStatus called with:', { id, status });

  try {
    const [result] = await pool.query(
      'UPDATE investment_details SET investment_status = ? WHERE investor_id = ?',
      [status, id]
    ) as any;
    
    console.log('✅ Status update successful, affected rows:', result.affectedRows || 0);
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating investor status:', error);
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
      // Generate UUIDs for user and profile
      const userId = uuidv4();
      const profileId = uuidv4();

      // Insert into users table
      await connection.query(
        'INSERT INTO users (id, email, password) VALUES (?, ?, ?)',
        [userId, data.email, hashedPassword]
      );

      // Insert into profiles table with role
      await connection.query(
        `INSERT INTO profiles (
          id, user_id, role, full_name, phone_number
        ) VALUES (?, ?, 'investor', ?, ?)`,
        [
          profileId,
          userId,
          data.full_name,
          data.phone_number || ''
        ]
      );

      // Insert into investors table (required for payments foreign key)
      const investorId = uuidv4();
      await connection.query(
        `INSERT INTO investors (
          id, user_id, full_name, email, phone_number,
          total_investment, number_of_bikes, monthly_return,
          investment_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          investorId,
          userId,
          data.full_name,
          data.email,
          data.phone_number || '',
          data.total_investment,
          data.number_of_bikes,
          0, // monthly_return will be calculated
          data.investment_date || new Date().toISOString().split('T')[0],
          data.status || 'active'
        ]
      );

      // Calculate total payout: capital + 25% profit distributed over 12 months
      const totalPayout = data.total_investment + (data.total_investment * 0.25);
      const monthlyReturn = totalPayout / 12;

      // Calculate dates
      const investmentDate = data.investment_date || new Date().toISOString().split('T')[0];
      const maturityDate = data.maturity_date || (() => {
        const maturity = new Date(investmentDate);
        maturity.setFullYear(maturity.getFullYear() + 1);
        return maturity.toISOString().split('T')[0];
      })();
      const nextPayoutDate = data.next_payout_date || (() => {
        const nextPayout = new Date(investmentDate);
        if (data.payout_frequency === 'weekly') {
          nextPayout.setDate(nextPayout.getDate() + 7);
        } else {
          nextPayout.setMonth(nextPayout.getMonth() + 1);
        }
        return nextPayout.toISOString().split('T')[0];
      })();

      // Insert into investment_details table
      await connection.query(
        `INSERT INTO investment_details (
          id, investor_id, total_investment, number_of_bikes, 
          monthly_return, investment_date, 
          maturity_date, next_payout_date, investment_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          userId,
          data.total_investment,
          data.number_of_bikes,
          monthlyReturn,
          investmentDate,
          maturityDate,
          nextPayoutDate,
          data.status || 'pending'
        ]
      );

      await connection.commit();
      return { success: true, id: userId };
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
        (SELECT DATE_FORMAT(payment_date, '%Y-%m-%d') FROM payments WHERE investor_id = i.id ORDER BY payment_date DESC LIMIT 1) as last_payment
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

export async function updateInvestor(id: string, data: InvestorInput): Promise<{ success: boolean }> {
  await checkAdminAuth();

  if (!data.email || !data.full_name) {
    throw new Error('Email and full name are required');
  }

  if (!data.total_investment || !data.number_of_bikes) {
    throw new Error('Investment details are required');
  }

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update users table if email changed
      await connection.query(
        'UPDATE users SET email = ? WHERE id = ?',
        [data.email, id]
      );

      // Update profiles table
      await connection.query(
        `UPDATE profiles SET 
          full_name = ?, 
          phone_number = ? 
         WHERE user_id = ?`,
        [
          data.full_name,
          data.phone_number || '',
          id
        ]
      );

      // Calculate total payout: capital + 25% profit distributed over 12 months
      const totalPayout = data.total_investment + (data.total_investment * 0.25);
      const monthlyReturn = totalPayout / 12;

      // Update investment_details table
      await connection.query(
        `UPDATE investment_details SET 
          total_investment = ?, 
          number_of_bikes = ?, 
          monthly_return = ?,
          investment_status = ?
         WHERE investor_id = ?`,
        [
          data.total_investment,
          data.number_of_bikes,
          monthlyReturn,
          data.status || 'active',
          data.status || 'active',
          id
        ]
      );

      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating investor:', error);
    throw new Error('Failed to update investor');
  }
}

export async function deleteInvestor(id: string): Promise<{ success: boolean }> {
  await checkAdminAuth();

  console.log('🗑️ Server deleteInvestor called with ID:', id);

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // First, verify the investor exists
      const [existingInvestor] = await connection.query(
        'SELECT u.id, u.email, p.full_name FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.id = ? AND p.role = "investor"',
        [id]
      ) as any;

      if (!existingInvestor || existingInvestor.length === 0) {
        throw new Error('Investor not found');
      }

      console.log('🔄 Found investor to delete:', existingInvestor[0]);

      // Delete from related tables first (foreign key constraints)
      console.log('🔄 Deleting payments...');
      const [paymentsResult] = await connection.query('DELETE FROM payments WHERE investor_id = ?', [id]) as any;
      console.log('✅ Deleted payments:', paymentsResult.affectedRows || 0);

      console.log('🔄 Deleting investment_details...');
      const [investmentResult] = await connection.query('DELETE FROM investment_details WHERE investor_id = ?', [id]) as any;
      console.log('✅ Deleted investment_details:', investmentResult.affectedRows || 0);

      console.log('🔄 Deleting profiles...');
      const [profilesResult] = await connection.query('DELETE FROM profiles WHERE user_id = ?', [id]) as any;
      console.log('✅ Deleted profiles:', profilesResult.affectedRows || 0);

      console.log('🔄 Deleting users...');
      const [usersResult] = await connection.query('DELETE FROM users WHERE id = ?', [id]) as any;
      console.log('✅ Deleted users:', usersResult.affectedRows || 0);

      if (usersResult.affectedRows === 0) {
        throw new Error('Failed to delete investor - user not found');
      }

      await connection.commit();
      console.log('✅ Delete transaction committed successfully');
      return { success: true };
    } catch (error) {
      await connection.rollback();
      console.error('❌ Delete transaction failed, rolling back:', error);
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Error deleting investor:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete investor');
  }
}

export async function getInvestorPayments(userId: string) {
  await checkAdminAuth();

  try {
    console.log('🔍 Getting payments for user ID:', userId);
    
    // First, look up the investor ID from the investors table using the user ID
    const [investorResult] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM investors WHERE user_id = ?',
      [userId]
    );
    
    if (!investorResult.length) {
      console.log('❌ No investor found for user ID:', userId);
      return [];
    }
    
    const investorId = investorResult[0].id;
    console.log('✅ Found investor ID:', investorId);
    
    const [payments] = await pool.query<RowDataPacket[]>(
      `SELECT 
        id,
        COALESCE(total_amount, amount) as amount,
        total_amount,
        interest_amount,
        principal_amount,
        payment_date,
        payment_type,
        status,
        notes,
        created_at,
        payout_frequency
      FROM payments 
      WHERE investor_id = ? 
      ORDER BY payment_date DESC`,
      [investorId]
    );

    console.log(`Found ${payments.length} payments for investor ${investorId}`);
    if (payments.length > 0) {
      console.log('Sample payment data:', {
        id: payments[0].id,
        amount: payments[0].amount,
        total_amount: payments[0].total_amount,
        interest_amount: payments[0].interest_amount,
        principal_amount: payments[0].principal_amount
      });
    }

    return payments;
  } catch (error) {
    console.error('Error fetching investor payments:', error);
    throw new Error('Failed to fetch payment history');
  }
}

export async function updateInvestmentDetails(investorId: string, data: {
  total_investment?: number;
  number_of_bikes?: number;
  monthly_return?: number;
  investment_status?: string;
  maturity_date?: string;
  next_payout_date?: string;
}): Promise<{ success: boolean }> {
  await checkAdminAuth();

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];

      if (data.total_investment !== undefined) {
        updateFields.push('total_investment = ?');
        updateValues.push(data.total_investment);
      }

      if (data.number_of_bikes !== undefined) {
        updateFields.push('number_of_bikes = ?');
        updateValues.push(data.number_of_bikes);
      }

      if (data.monthly_return !== undefined) {
        updateFields.push('monthly_return = ?');
        updateValues.push(data.monthly_return);
      } else if (data.total_investment !== undefined) {
        // Recalculate monthly return based on total payout (capital + 25% profit) divided by 12
        const totalPayout = data.total_investment + (data.total_investment * 0.25);
        const monthlyReturn = totalPayout / 12;
        updateFields.push('monthly_return = ?');
        updateValues.push(monthlyReturn);
        // Note: total_return column doesn't exist in the database, so we skip it
      }

      if (data.investment_status !== undefined) {
        updateFields.push('investment_status = ?');
        updateValues.push(data.investment_status);
      }

      if (data.maturity_date !== undefined) {
        updateFields.push('maturity_date = ?');
        updateValues.push(data.maturity_date);
      }

      if (data.next_payout_date !== undefined) {
        updateFields.push('next_payout_date = ?');
        updateValues.push(data.next_payout_date);
      }

      if (updateFields.length > 0) {
        updateValues.push(investorId);
        
        await connection.query(
          `UPDATE investment_details SET ${updateFields.join(', ')} WHERE investor_id = ?`,
          updateValues
        );
      }

      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating investment details:', error);
    throw new Error('Failed to update investment details');
  }
}

export async function addPaymentRecord(userId: string, data: {
  total_amount: number;
  interest_amount: number;
  principal_amount: number;
  payout_frequency: 'weekly' | 'monthly';
  payment_date?: string;
  status?: 'pending' | 'completed' | 'failed';
  notes?: string;
}): Promise<{ success: boolean; id: string }> {
  await checkAdminAuth();

  try {
    console.log('🔄 Adding payment for user ID:', userId);
    console.log('💰 Payment data:', data);
    
    const paymentId = uuidv4();
    
    // Look up the investor ID from the investors table using the user ID
    console.log('🔍 Looking up investor ID for user:', userId);
    const [investorResult] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM investors WHERE user_id = ?',
      [userId]
    );
    
    if (!investorResult.length) {
      console.log('❌ No investor found for user ID:', userId);
      throw new Error(`No investor found for user ID: ${userId}`);
    }
    
    const investorId = investorResult[0].id;
    console.log('✅ Found investor ID:', investorId);
    
    console.log('💾 Inserting payment record...');
    await pool.query(
      `INSERT INTO payments (
        id, investor_id, amount, total_amount, interest_amount, principal_amount, 
        payment_date, status, notes, payout_frequency, payment_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        paymentId,
        investorId,
        data.total_amount,
        data.total_amount,
        data.interest_amount,
        data.principal_amount,
        data.payment_date || new Date().toISOString().split('T')[0],
        data.status || 'completed',
        data.notes || '',
        data.payout_frequency,
        'monthly_return'
      ]
    );

    console.log('✅ Payment record inserted successfully!');
    console.log('📧 Sending payment notification...');

    // Send notification to investor (using userId for notification lookup)
    await sendPaymentNotification(userId, {
      total_amount: data.total_amount,
      interest_amount: data.interest_amount,
      principal_amount: data.principal_amount,
      payout_frequency: data.payout_frequency,
      payment_date: data.payment_date || new Date().toISOString().split('T')[0]
    });

    console.log('✅ Payment notification sent successfully!');
    console.log('🎉 Payment process completed for ID:', paymentId);

    return { success: true, id: paymentId };
  } catch (error) {
    console.error('Error adding payment record:', error);
    throw new Error('Failed to add payment record');
  }
}

async function sendPaymentNotification(investorId: string, paymentData: {
  total_amount: number;
  interest_amount: number;
  principal_amount: number;
  payout_frequency: 'weekly' | 'monthly';
  payment_date: string;
}) {
  try {
    // Get investor details
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        u.email,
        p.full_name
      FROM users u
      JOIN profiles p ON u.id = p.user_id
      WHERE u.id = ?`,
      [investorId]
    );

    if (!rows || rows.length === 0) {
      throw new Error('Investor not found');
    }

    const investor = rows[0];
    
    // Create notification record
    const notificationId = uuidv4();
    const message = `Payment processed: ₦${paymentData.total_amount.toLocaleString()} (Interest: ₦${paymentData.interest_amount.toLocaleString()}, Principal: ₦${paymentData.principal_amount.toLocaleString()})`;
    
    await pool.query(
      `INSERT INTO notifications (
        id, user_id, message, type, created_at
      ) VALUES (?, ?, ?, 'payment', NOW())`,
      [
        notificationId,
        investorId,
        message
      ]
    );

    // Send email notification
    await sendPaymentEmail(investor.email, investor.full_name, paymentData);
    
    console.log('Payment notification sent successfully');
  } catch (error) {
    console.error('Error sending payment notification:', error);
    // Don't throw here as we don't want to fail the payment if notification fails
  }
}

async function sendPaymentEmail(email: string, fullName: string, paymentData: {
  total_amount: number;
  interest_amount: number;
  principal_amount: number;
  payout_frequency: 'weekly' | 'monthly';
  payment_date: string;
}) {
  try {
    await sendPaymentNotificationEmail(email, fullName, paymentData);
    console.log('Payment email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending payment email:', error);
  }
}
