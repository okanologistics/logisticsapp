-- Create investment_details table
CREATE TABLE IF NOT EXISTS investment_details (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    investor_id CHAR(36) NOT NULL,
    total_investment DECIMAL(10,2) NOT NULL DEFAULT 0,
    number_of_bikes INT NOT NULL DEFAULT 0,
    monthly_return DECIMAL(10,2) NOT NULL DEFAULT 0,
    investment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    maturity_date TIMESTAMP NULL,
    next_payout_date TIMESTAMP NULL,
    investment_status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (investor_id) REFERENCES investors(id) ON DELETE CASCADE
);

-- Add index for investor_id
CREATE INDEX idx_investment_investor ON investment_details(investor_id);
