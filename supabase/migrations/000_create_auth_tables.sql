-- Create users table for authentication with secure password storage
-- Users registered via email/password or Google OAuth

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  
  -- Password storage (for email/password auth only)
  password_hash VARCHAR(255), -- scrypt derived hash
  password_salt VARCHAR(255), -- random salt
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add password columns if users table exists but lacks them (migration safety)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_salt VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create OTP verifications table for email verification during signup
-- Stores temporary 6-digit codes with expiry and attempt tracking

CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  
  -- Expiry & Validation
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  
  -- Rate limiting & Security
  attempts_remaining INTEGER DEFAULT 3,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_verifications_email ON otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_created_at ON otp_verifications(created_at DESC);
