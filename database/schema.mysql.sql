-- Travel Stories — MySQL/MariaDB schema (production, cPanel).
-- Import once into an EMPTY database via phpMyAdmin, then import seed.sql.
-- Requires MySQL 5.7+ / MariaDB 10.2+ for JSON columns.

CREATE TABLE IF NOT EXISTS states (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) UNIQUE NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  best_season VARCHAR(80),
  peak_season VARCHAR(80),
  highlights JSON,
  image_url TEXT,
  color VARCHAR(16)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS districts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  state_id INT NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  UNIQUE KEY uq_district_state (state_id, name),
  KEY idx_districts_state (state_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tourist_spots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  district_id INT NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  category VARCHAR(60),
  image_url TEXT,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0,
  entry_fee VARCHAR(60),
  visit_duration VARCHAR(60),
  KEY idx_spots_district (district_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS accommodations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tourist_spot_id INT NOT NULL REFERENCES tourist_spots(id) ON DELETE CASCADE,
  name VARCHAR(160) NOT NULL,
  type VARCHAR(40),
  tier VARCHAR(20),
  price_per_night DECIMAL(10,2),
  rating DECIMAL(2,1) DEFAULT 0,
  amenities JSON,
  image_url TEXT,
  address TEXT,
  KEY idx_accommodations_spot (tourist_spot_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS travel_agents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  logo_url TEXT,
  verified TINYINT(1) NOT NULL DEFAULT 1,
  rating DECIMAL(2,1) DEFAULT 0,
  description TEXT,
  contact_email VARCHAR(160),
  contact_phone VARCHAR(40)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS travel_packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agent_id INT NOT NULL REFERENCES travel_agents(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  state_name VARCHAR(120),
  duration_days INT,
  price DECIMAL(10,2),
  inclusions JSON,
  exclusions JSON,
  itinerary JSON,
  image_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  category VARCHAR(40),
  max_group_size INT,
  KEY idx_packages_agent (agent_id),
  KEY idx_packages_category (category),
  KEY idx_packages_state (state_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  package_id INT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(40),
  travelers VARCHAR(10),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
