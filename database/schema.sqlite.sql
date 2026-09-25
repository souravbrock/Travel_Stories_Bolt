-- Travel Stories — SQLite schema (LOCAL PREVIEW ONLY, never deploy).
-- Generated from schema.mysql.sql by keeping the same tables/columns with
-- SQLite-compatible DDL. Data: database/seed.sql (portable, shared).

CREATE TABLE IF NOT EXISTS states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(120) UNIQUE NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  best_season VARCHAR(80),
  peak_season VARCHAR(80),
  highlights TEXT,
  image_url TEXT,
  color VARCHAR(16)
);

CREATE TABLE IF NOT EXISTS districts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  state_id INT NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  UNIQUE (state_id, name)
);
CREATE INDEX IF NOT EXISTS idx_districts_state ON districts(state_id);

CREATE TABLE IF NOT EXISTS tourist_spots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  district_id INT NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  category VARCHAR(60),
  image_url TEXT,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0,
  entry_fee VARCHAR(60),
  visit_duration VARCHAR(60)
);
CREATE INDEX IF NOT EXISTS idx_spots_district ON tourist_spots(district_id);

CREATE TABLE IF NOT EXISTS accommodations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tourist_spot_id INT NOT NULL REFERENCES tourist_spots(id) ON DELETE CASCADE,
  name VARCHAR(160) NOT NULL,
  type VARCHAR(40),
  tier VARCHAR(20),
  price_per_night DECIMAL(10,2),
  rating DECIMAL(2,1) DEFAULT 0,
  amenities TEXT,
  image_url TEXT,
  address TEXT
);
CREATE INDEX IF NOT EXISTS idx_accommodations_spot ON accommodations(tourist_spot_id);

CREATE TABLE IF NOT EXISTS travel_agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(160) NOT NULL,
  logo_url TEXT,
  verified TINYINT(1) NOT NULL DEFAULT 1,
  rating DECIMAL(2,1) DEFAULT 0,
  description TEXT,
  contact_email VARCHAR(160),
  contact_phone VARCHAR(40)
);

CREATE TABLE IF NOT EXISTS travel_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id INT NOT NULL REFERENCES travel_agents(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  state_name VARCHAR(120),
  duration_days INT,
  price DECIMAL(10,2),
  inclusions TEXT,
  exclusions TEXT,
  itinerary TEXT,
  image_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  category VARCHAR(40),
  max_group_size INT
);
CREATE INDEX IF NOT EXISTS idx_packages_agent ON travel_packages(agent_id);
CREATE INDEX IF NOT EXISTS idx_packages_category ON travel_packages(category);
CREATE INDEX IF NOT EXISTS idx_packages_state ON travel_packages(state_name);

CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  package_id INT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(40),
  travelers VARCHAR(10),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
