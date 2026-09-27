-- Travel Stories — Auth + vendor marketplace schema (production MySQL/MariaDB).
-- Import AFTER schema.mysql.sql. Safe to re-import (IF NOT EXISTS guards).
-- Requires MariaDB 10.2+ / MySQL 8+ (ADD COLUMN IF NOT EXISTS is MariaDB-only;
-- on plain MySQL 8, drop the IF NOT EXISTS clause after first import).

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(40),
  role ENUM('customer','vendor','admin') NOT NULL DEFAULT 'customer',
  email_verified TINYINT(1) NOT NULL DEFAULT 0,
  vendor_type VARCHAR(40),
  vendor_approved TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS verification_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(160) NOT NULL,
  code CHAR(5) NOT NULL,
  expires_at DATETIME NOT NULL,
  consumed TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_vc_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS auth_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token CHAR(64) UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_at_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vendor_packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  state_name VARCHAR(120),
  duration_days INT,
  price DECIMAL(10,2),
  category VARCHAR(40),
  max_group_size INT,
  image_url TEXT,
  approved TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_vp_vendor (vendor_id),
  KEY idx_vp_approved (approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vendor_accommodations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(160) NOT NULL,
  type VARCHAR(20),
  tier VARCHAR(20),
  price_per_night DECIMAL(10,2),
  address TEXT,
  amenities JSON,
  image_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  tourist_spot_id INT NULL REFERENCES tourist_spots(id) ON DELETE SET NULL,
  approved TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_va_vendor (vendor_id),
  KEY idx_va_approved (approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vendor_vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_name VARCHAR(160) NOT NULL,
  vehicle_type VARCHAR(60),
  seats VARCHAR(40),
  price_per_day DECIMAL(10,2),
  image_url TEXT,
  approved TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_vv_vendor (vendor_id),
  KEY idx_vv_approved (approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inquiries can target curated packages (package_id) or vendor packages.
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS vendor_package_id INT NULL;
