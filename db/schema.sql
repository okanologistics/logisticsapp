-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('admin', 'investor') NOT NULL DEFAULT 'investor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create investors table
CREATE TABLE IF NOT EXISTS investors (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    investor_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (investor_id) REFERENCES investors(id)
);

-- Create admin user
INSERT INTO users (id, email, password, created_at, updated_at)
VALUES (
    'cbe34ad9-84c6-4cef-8081-9b209e1e036a',
    'samuelekelejnr@gmail.com',
    '$2a$10$your_hashed_password', -- You'll need to generate this with bcrypt
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Create admin profile
INSERT INTO profiles (id, user_id, role, created_at, updated_at)
VALUES (
    UUID(),
    'cbe34ad9-84c6-4cef-8081-9b209e1e036a',
    'admin',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
