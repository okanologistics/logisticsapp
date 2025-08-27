-- Add email verification and password reset fields
ALTER TABLE users
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN email_verified_at TIMESTAMP NULL,
ADD COLUMN reset_token TEXT NULL,
ADD COLUMN reset_token_expires TIMESTAMP NULL;
