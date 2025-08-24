-- Add total_return column to investment_details table
ALTER TABLE investment_details 
ADD COLUMN total_return DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER monthly_return;
