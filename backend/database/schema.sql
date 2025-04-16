CREATE DATABASE IF NOT EXISTS daystar_daycare;
USE daystar_daycare;
-- drop DATABASE daystar_daycare;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(55) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
SELECT * FROM USERS;
CREATE TABLE IF NOT EXISTS babysitters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone_number VARCHAR(20) NOT NULL,
  nin VARCHAR(20) NOT NULL UNIQUE,
  age INT NOT NULL,
  next_of_kin_name VARCHAR(100) NOT NULL,
  next_of_kin_phone VARCHAR(20) NOT NULL,
  next_of_kin_relationship VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS children (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  age INT NOT NULL,
  parent_name VARCHAR(100) NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  parent_email VARCHAR(100),
  special_care_needs TEXT,
  session_type ENUM('half-day', 'full-day') NOT NULL,
  assigned_babysitter_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_babysitter_id) REFERENCES babysitters(id)
);
SELECT * FROM USERS;
USE daystar_daycare;

CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  child_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('present', 'absent', 'late') NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id)
);

CREATE TABLE IF NOT EXISTS financial_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  child_id INT,
  type ENUM('income', 'expense') NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (child_id) REFERENCES children(id)
);

USE daystar_daycare;

SELECT * FROM financial_transactions;
use daystar_daycare;
DROP TABLE IF EXISTS financial_transactions;
CREATE TABLE IF NOT EXISTS incident_report (
  id INT AUTO_INCREMENT PRIMARY KEY,
  child_id INT NOT NULL,
  reported_by INT NOT NULL,
  target ENUM('manager', 'parent') NOT NULL,
  incident_type VARCHAR(20),
  description TEXT NOT NULL,
  status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id),
  FOREIGN KEY (reported_by) REFERENCES babysitters(id)
);

use daystar_daycare;
select * from financial_transactions;

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient_id INT NOT NULL,
  recipient_type ENUM('user', 'child') NOT NULL,
  type ENUM('payment-reminder', 'payment-overdue', 'incident-report', 'attendance-update', 'system-alert') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  target VARCHAR(25) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS babysitter_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  babysitter_id INT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  session_type ENUM('half-day', 'full-day') NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (babysitter_id) REFERENCES babysitters(id)
);
SELECT * FROM babysitter_schedules;
SELECT * FROM babysitters;
select * from children;
use daystar_daycare;
SELECT * from notifications;
select * from incident_report;
DELETE FROM users WHERE id = 1;
DELETE FROM babysitters WHERE email = 'nabasaisaac16@gmail.com';
-- ALTER TABLE users AUTO_INCREMENT = 1;

-- INSERT INTO users (username, email, password) 
-- VALUES ('NABASA ISAAC', 'nabasaisaac16@gmail.com', 'nabasaisaac16@gmail.com');

-- Create babysitter_payments table
CREATE TABLE IF NOT EXISTS babysitter_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    babysitter_id INT NOT NULL,
    date DATE NOT NULL,
    session_type ENUM('full-day', 'half-day') NOT NULL,
    children_count INT NOT NULL DEFAULT 0,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (babysitter_id) REFERENCES babysitters(id) ON DELETE CASCADE
);

select * from babysitters;
SELECT * FROM babysitter_payments;
use daystar_daycare;
-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    period_type ENUM('monthly', 'weekly') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT unique_category_period UNIQUE (category, period_type, start_date)
);

-- Create budget tracking table
CREATE TABLE IF NOT EXISTS budget_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    budget_id INT NOT NULL,
    actual_amount DECIMAL(10, 2) NOT NULL,
    tracking_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (budget_id) REFERENCES budgets(id)
);

-- To be deleted later
USE daystar_daycare;
SELECT * FROM financial_transactions;
SELECT * FROM budgets;
SELECT SUM(amount) from budgets;
DELETE FROM budgets;
SELECT * FROM budget_tracking;
