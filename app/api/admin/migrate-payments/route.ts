import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { checkAdminAuth } from '@/app/admin/dashboard/auth';

export async function POST(request: NextRequest) {
  try {
    await checkAdminAuth();

    console.log('Running payment breakdown migration...');

    // Add payment breakdown columns
    try {
      await pool.query(`
        ALTER TABLE payments 
        ADD COLUMN total_amount DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER amount,
        ADD COLUMN interest_amount DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER total_amount,
        ADD COLUMN principal_amount DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER interest_amount,
        ADD COLUMN payout_frequency ENUM('weekly', 'monthly') NOT NULL DEFAULT 'monthly' AFTER principal_amount
      `);
      console.log('✓ Added payment breakdown columns');
    } catch (error: any) {
      if (!error.message.includes('Duplicate column')) {
        console.log('Payment breakdown columns might already exist:', error.message);
      }
    }

    // Create notifications table
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          message TEXT NOT NULL,
          type ENUM('payment', 'general', 'system') NOT NULL DEFAULT 'general',
          read_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_notifications (user_id, created_at DESC)
        )
      `);
      console.log('✓ Created notifications table');
    } catch (error: any) {
      console.log('Notifications table creation result:', error.message);
    }

    // Add payout_frequency to investment_details table
    try {
      await pool.query(`
        ALTER TABLE investment_details 
        ADD COLUMN payout_frequency ENUM('weekly', 'monthly') NOT NULL DEFAULT 'monthly' AFTER investment_status
      `);
      console.log('✓ Added payout_frequency to investment_details table');
    } catch (error: any) {
      if (!error.message.includes('Duplicate column')) {
        console.log('investment_details payout_frequency column might already exist:', error.message);
      }
    }

    // Add weekly_return column
    try {
      await pool.query(`
        ALTER TABLE investment_details
        ADD COLUMN weekly_return DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER monthly_return
      `);
      console.log('✓ Added weekly_return column');
    } catch (error: any) {
      if (!error.message.includes('Duplicate column')) {
        console.log('weekly_return column might already exist:', error.message);
      }
    }

    // Add indexes
    try {
      await pool.query('CREATE INDEX IF NOT EXISTS idx_payments_payout_frequency ON payments(payout_frequency)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date DESC)');
      console.log('✓ Added database indexes');
    } catch (error: any) {
      console.log('Index creation result:', error.message);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Payment breakdown migration completed successfully' 
    });

  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Migration failed' 
    }, { status: 500 });
  }
}
