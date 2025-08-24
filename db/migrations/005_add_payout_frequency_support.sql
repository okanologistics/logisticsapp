-- Update payments table to support payment breakdown
-- Add new columns for payment breakdown tracking

-- Add payment breakdown columns
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER amount,
ADD COLUMN IF NOT EXISTS interest_amount DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER total_amount,
ADD COLUMN IF NOT EXISTS principal_amount DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER interest_amount,
ADD COLUMN IF NOT EXISTS payout_frequency ENUM('weekly', 'monthly') NOT NULL DEFAULT 'monthly' AFTER principal_amount;

-- Remove old payment_type column as it's no longer needed
-- ALTER TABLE payments DROP COLUMN IF EXISTS payment_type;

-- Create notifications table for investor notifications
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
);

-- Add payout_frequency to investment_details table to track investor preference
ALTER TABLE investment_details 
ADD COLUMN IF NOT EXISTS payout_frequency ENUM('weekly', 'monthly') NOT NULL DEFAULT 'monthly' AFTER investment_status;

-- Add weekly_return column for investors who prefer weekly payouts
ALTER TABLE investment_details
ADD COLUMN IF NOT EXISTS weekly_return DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER monthly_return;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_payout_frequency ON payments(payout_frequency);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_investment_payout_frequency ON investment_details(payout_frequency);
