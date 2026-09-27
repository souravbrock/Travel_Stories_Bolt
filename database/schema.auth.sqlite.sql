-- Travel Stories — Auth + vendor schema (LOCAL PREVIEW ONLY, SQLite).
-- Applied fresh by scripts/make_preview.py after schema.sqlite.sql.

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(40),
  role VARCHAR(20) NOT NULL DEFAULT 'customer',
  email_verified TINYINT(1) NOT NULL DEFAULT 0,
  vendor_type VARCHAR(40),
  vendor_approved TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS verification_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(160) NOT NULL,
  code CHAR(5) NOT NULL,
  expires_at DATETIME NOT NULL,
  consumed TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_vc_email ON verification_codes(email);

CREATE TABLE IF NOT EXISTS auth_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token CHAR(64) UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_at_user ON auth_tokens(user_id);

CREATE TABLE IF NOT EXISTS vendor_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_vp_vendor ON vendor_packages(vendor_id);

CREATE TABLE IF NOT EXISTS vendor_accommodations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(160) NOT NULL,
  type VARCHAR(20),
  tier VARCHAR(20),
  price_per_night DECIMAL(10,2),
  address TEXT,
  amenities TEXT,
  image_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  tourist_spot_id INT NULL REFERENCES tourist_spots(id) ON DELETE SET NULL,
  approved TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_va_vendor ON vendor_accommodations(vendor_id);

CREATE TABLE IF NOT EXISTS vendor_vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_name VARCHAR(160) NOT NULL,
  vehicle_type VARCHAR(60),
  seats VARCHAR(40),
  price_per_day DECIMAL(10,2),
  image_url TEXT,
  approved TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_vv_vendor ON vendor_vehicles(vendor_id);

-- Inquiries can target curated packages (package_id) or vendor packages.
-- (Fresh preview DBs only; production uses ADD COLUMN IF NOT EXISTS.)
ALTER TABLE inquiries ADD COLUMN vendor_package_id INT NULL;
