-- Fix password column length in users table to accommodate bcrypt hashes
USE daystar;

-- Update the password column to VARCHAR(255) to accommodate bcrypt hashes (60 characters)
ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NOT NULL;

-- Verify the change
DESCRIBE users; 