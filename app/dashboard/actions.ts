'use server';

import { checkInvestorAuth } from '@/lib/auth';
import { pool } from '@/lib/db';
import mysql from 'mysql2/promise';

// Interfaces
interface InvestorData {
  id: string;
  email: string;
  role: string;
  full_name?: string;
  profile_image?: string; // Add profile_image field to interface
  phone_number?: string;
  monthly_return?: number;
  total_investment?: number;
  number_of_bikes?: number;
  investment_status?: string;
  investment_date?: string;
  maturity_date?: string;
  next_payout_date?: string;
  account_number?: string;
}

interface Payment {
  id: string;
  investor_id: string;
  status: string;
  amount: number;
  total_amount?: number;
  interest_amount?: number;
  principal_amount?: number;
  payout_frequency?: string;
  payment_type?: string;
  notes?: string;
  created_at: string;
}

interface Notification {
  id: string;
  investor_id: string;
  message: string;
  created_at: string;
  read: boolean;
}

interface DashboardData {
  investor: {
    id: string;
    email: string;
    phone: string;
    emailFull: string;
    phoneFull: string;
    full_name: string;
    profile_image?: string; // Add profile_image field to DashboardData interface
    monthly_return: number;
    total_investment: number;
    number_of_bikes: number;
    investment_status: string;
    investment_date?: string;
    maturity_date?: string;
    next_payout_date?: string;
  };
  notifications: Notification[];
  payments: Payment[];
  stats: {
    totalPayouts: number;
    totalReturn: number;
    remainingAmount: number;
    weeklyPayment: number;
  };
}

// Action to get investor dashboard data
// Update investor profile
export const updateInvestorProfile = async (data: { 
  phone: string; 
  full_name?: string;
  profile_image?: string;
}) => {
  console.log('=== updateInvestorProfile called ===');
  console.log('Raw input data:', JSON.stringify(data, null, 2));
  
  const session = await checkInvestorAuth();
  if (!session?.user?.email) {
    throw new Error('No authenticated user found');
  }

  console.log('Updating profile with data:', data);

  const connection = await pool.getConnection();
  try {
    // First get the user's ID
    const [userRows] = await connection.execute<mysql.RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [session.user.email]
    );

    if (!userRows[0]?.id) {
      throw new Error('User not found');
    }

    // Build update query dynamically based on provided data
    let updateFields = [];
    let updateValues = [];

    if (data.phone) {
      updateFields.push('phone_number = ?');
      updateValues.push(data.phone);
    }
    if (data.full_name !== undefined) {
      updateFields.push('full_name = ?');
      updateValues.push(data.full_name);
    }
    // Only update profile_image if it's explicitly provided (not undefined)
    if (data.profile_image !== undefined) {
      console.log('Including profile_image in update:', data.profile_image);
      updateFields.push('profile_image = ?');
      updateValues.push(data.profile_image);
    } else {
      console.log('profile_image is undefined, not updating it');
    }

    // Only run the update if we have fields to update
    if (updateFields.length > 0) {
      updateValues.push(userRows[0].id);
      const query = `UPDATE profiles SET ${updateFields.join(', ')} WHERE user_id = ?`;
      console.log('Executing update query:', query, 'with values:', updateValues);
      
      await connection.execute(query, updateValues);
      console.log('Profile updated successfully');
    }
    return { success: true };
  } catch (error) {
    console.error('Error updating investor profile:', error);
    throw new Error('Failed to update profile');
  } finally {
    connection.release();
  }
};

// Get investor dashboard data
export const getInvestorData = async (): Promise<DashboardData> => {
  try {
    console.log('Fetching investor data...');
    const session = await checkInvestorAuth();
    
    if (!session?.user?.email) {
      console.error('No session found');
      throw new Error('Not authenticated');
    }

    console.log('Session found for user:', session.user.email);

    const connection = await pool.getConnection();

    try {
      // First get user and profile data with investment details
      const [userRows] = await connection.execute<mysql.RowDataPacket[]>(
        `SELECT 
          u.id,
          u.email,
          p.role,
          p.full_name,
          p.profile_image,
          COALESCE(p.phone_number, '') as phone_number,
          COALESCE(inv.total_investment, 0) as total_investment,
          COALESCE(inv.number_of_bikes, 0) as number_of_bikes,
          COALESCE(inv.monthly_return, 0) as monthly_return,
          COALESCE(inv.investment_status, 'pending') as investment_status,
          DATE_FORMAT(inv.investment_date, '%Y-%m-%d') as investment_date,
          DATE_FORMAT(inv.maturity_date, '%Y-%m-%d') as maturity_date,
          DATE_FORMAT(inv.next_payout_date, '%Y-%m-%d') as next_payout_date
         FROM users u 
         LEFT JOIN profiles p ON u.id COLLATE utf8mb4_unicode_ci = p.user_id COLLATE utf8mb4_unicode_ci
         LEFT JOIN investment_details inv ON u.id COLLATE utf8mb4_unicode_ci = inv.investor_id COLLATE utf8mb4_unicode_ci
         WHERE u.email = ? AND p.role = 'investor'`,
        [session.user.email]
      );
    
    const investor = userRows[0] as InvestorData;
    if (!investor) {
      throw new Error('Investor not found');
    }
    console.log('Found investor:', investor);

    // Initialize empty arrays for payments and notifications
    // Arrays to store fetched data
    let dashboardPayments: Payment[] = [];
    let dashboardNotifications: Notification[] = [];

    // Try to fetch payments if the table exists
    try {
      const [tableCheck] = await connection.execute<mysql.RowDataPacket[]>(
        'SHOW TABLES LIKE "payments"'
      );
      
      if (tableCheck.length > 0) {
        const [paymentRows] = await connection.execute<mysql.RowDataPacket[]>(
          `SELECT p.id, p.investor_id, p.amount, p.total_amount, p.interest_amount, p.principal_amount, 
                  p.payout_frequency, p.payment_type, p.status, p.notes, 
                  DATE_FORMAT(p.created_at, "%Y-%m-%d %H:%i:%s") as created_at,
                  DATE_FORMAT(p.payment_date, "%Y-%m-%d") as payment_date
           FROM payments p 
           JOIN investors i ON p.investor_id = i.id 
           WHERE i.user_id = ? 
           ORDER BY p.created_at DESC`,
          [investor.id]
        );
        dashboardPayments = paymentRows as Payment[];
      }
    } catch (error) {
      console.log('Error checking/fetching payments:', error);
    }

    // Try to fetch notifications if the table exists
    try {
      const [tableCheck] = await connection.execute<mysql.RowDataPacket[]>(
        'SHOW TABLES LIKE "notifications"'
      );
      
      if (tableCheck.length > 0) {
        const [notificationRows] = await connection.execute<mysql.RowDataPacket[]>(
          `SELECT n.id, n.investor_id, n.message, DATE_FORMAT(n.created_at, "%Y-%m-%d %H:%i:%s") as created_at, n.\`read\` 
           FROM notifications n 
           JOIN investors i ON n.investor_id = i.id 
           WHERE i.user_id = ? 
           ORDER BY n.created_at DESC`,
          [investor.id]
        );
        dashboardNotifications = notificationRows as Notification[];
      }
    } catch (error) {
      console.log('Error checking/fetching notifications:', error);
    }
    console.log('Calculating totals and formatting data...');
    
    const totalPayouts = dashboardPayments
      .filter((p: Payment) => p.status === 'completed')
      .reduce((sum: number, p: Payment) => sum + Number(p.total_amount || p.amount || 0), 0);

    console.log('Payment calculation details:', {
      totalPayments: dashboardPayments.length,
      completedPayments: dashboardPayments.filter(p => p.status === 'completed').length,
      calculatedTotalPayouts: totalPayouts,
      samplePayment: dashboardPayments[0] ? {
        amount: dashboardPayments[0].amount,
        total_amount: dashboardPayments[0].total_amount,
        status: dashboardPayments[0].status
      } : 'No payments found'
    });

    // Use actual investment values from database
    const totalInvestment = investor.total_investment || 0;
    const numberOfBikes = investor.number_of_bikes || 0;
    const monthlyReturn = investor.monthly_return || 0;
    
    // Total return should be the total expected payout (capital + profit) based on monthly return
    const totalReturn = monthlyReturn * 12; // Total expected payout over 12 months
    const remainingAmount = totalReturn - totalPayouts;
    
    console.log('Investment data:', {
      totalInvestment,
      numberOfBikes,
      monthlyReturn,
      totalReturn,
      totalPayouts,
      remainingAmount
    });
    
    // Format phone number if it exists, otherwise use empty string
    const phoneNumber = investor.phone_number || '';
    const maskedPhone = phoneNumber 
      ? phoneNumber.replace(/(\d{3})\d{6}(\d{4})/, '$1******$2')
      : '';

    const formattedData: DashboardData = {
      investor: {
        id: investor.id,
        email: investor.email.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + '*'.repeat(b.length)),
        phone: maskedPhone,
        emailFull: investor.email,
        phoneFull: phoneNumber,
        full_name: investor.full_name || 'Investor',
        profile_image: investor.profile_image, // Add the missing profile_image field!
        monthly_return: monthlyReturn,
        total_investment: totalInvestment,
        number_of_bikes: numberOfBikes,
        investment_status: investor.investment_status || 'pending',
        investment_date: investor.investment_date,
        maturity_date: investor.maturity_date,
        next_payout_date: investor.next_payout_date
      },
      notifications: dashboardNotifications,
      payments: dashboardPayments,
      stats: {
        totalPayouts,
        totalReturn,
        remainingAmount,
        weeklyPayment: monthlyReturn / 4
      }
    };

      console.log('Data formatting complete');
      return formattedData;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error in getInvestorData:', error);
    throw error;
  }
};
