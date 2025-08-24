-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(36) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('admin', 'investor') DEFAULT 'investor',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create investors table
CREATE TABLE IF NOT EXISTS investors (
    id VARCHAR(36) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id VARCHAR(36) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    total_investment DECIMAL(15, 2) NOT NULL DEFAULT 0,
    number_of_bikes INT NOT NULL DEFAULT 0,
    monthly_return DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_return DECIMAL(15, 2) NOT NULL DEFAULT 0,
    interest_earned DECIMAL(15, 2) NOT NULL DEFAULT 0,
    investment_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    next_payout_date DATE NOT NULL,
    last_payout_date DATE NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    investor_id VARCHAR(36) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_type ENUM('monthly_return', 'principal_return'),
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    notes TEXT
);
