-- Update investment_details table structure
-- Add total_return column and increase decimal precision for large amounts
ALTER TABLE investment_details 
ADD COLUMN IF NOT EXISTS total_return DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER monthly_return;

-- Update decimal field sizes to handle larger amounts
ALTER TABLE investment_details 
MODIFY COLUMN total_investment DECIMAL(15,2) NOT NULL DEFAULT 0,
MODIFY COLUMN monthly_return DECIMAL(15,2) NOT NULL DEFAULT 0;
