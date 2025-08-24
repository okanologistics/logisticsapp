-- Add foreign key constraint to investment_details table
ALTER TABLE investment_details
ADD CONSTRAINT fk_investment_investor
FOREIGN KEY (investor_id) REFERENCES investors(id)
ON DELETE CASCADE;
