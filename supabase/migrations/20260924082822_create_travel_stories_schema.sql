/*
# Travel Stories — Core Discovery Schema

## Overview
Creates the foundational schema for the Travel Stories India travel platform.
This is a public-content, no-auth discovery app: all data is browsable by anyone.
No user accounts or sign-in are required to browse destinations.

## New Tables

### states
- `id` (serial, primary key) — internal id
- `name` (text, unique, not null) — full state name matching the map's `st_nm` property
- `slug` (text, unique, not null) — URL-safe slug (e.g. "kerala")
- `tagline` (text) — short marketing tagline
- `description` (text) — longer overview
- `best_season` (text) — e.g. "Winter (Oct–Feb)"
- `peak_season` (text) — e.g. "December"
- `highlights` (text[]) — array of key regional highlights
- `image_url` (text) — hero image URL
- `color` (text) — hex color for map coloring

### districts
- `id` (serial, primary key)
- `state_id` (int, references states) — parent state
- `name` (text, not null) — district name matching map's `district` property
- `description` (text)

### tourist_spots
- `id` (serial, primary key)
- `district_id` (int, references districts)
- `name` (text, not null)
- `description` (text)
- `category` (text) — e.g. "Beach", "Heritage", "Hill Station"
- `image_url` (text)
- `latitude` (numeric) — for distance calculations
- `longitude` (numeric)
- `rating` (numeric, default 0) — 0–5 average rating
- `entry_fee` (text) — e.g. "Free", "₹250"
- `visit_duration` (text) — e.g. "2–3 hours"

### accommodations
- `id` (serial, primary key)
- `tourist_spot_id` (int, references tourist_spots)
- `name` (text, not null)
- `type` (text) — "Hotel" | "Resort" | "Homestay"
- `tier` (text) — "Budget" | "Deluxe" | "Luxury"
- `price_per_night` (numeric) — in INR
- `rating` (numeric)
- `amenities` (text[])
- `image_url` (text)
- `address` (text)

## Security
- RLS enabled on all tables.
- All tables are public/shared (no-auth discovery app): anon + authenticated can SELECT.
- No INSERT/UPDATE/DELETE policies — data is managed via migrations only.
*/

CREATE TABLE IF NOT EXISTS states (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  tagline text,
  description text,
  best_season text,
  peak_season text,
  highlights text[] DEFAULT '{}',
  image_url text,
  color text
);

ALTER TABLE states ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_states" ON states;
CREATE POLICY "public_read_states" ON states FOR SELECT
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS districts (
  id serial PRIMARY KEY,
  state_id int NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  UNIQUE (state_id, name)
);

ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_districts" ON districts;
CREATE POLICY "public_read_districts" ON districts FOR SELECT
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS tourist_spots (
  id serial PRIMARY KEY,
  district_id int NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text,
  image_url text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  rating numeric(2,1) DEFAULT 0,
  entry_fee text,
  visit_duration text
);

ALTER TABLE tourist_spots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_tourist_spots" ON tourist_spots;
CREATE POLICY "public_read_tourist_spots" ON tourist_spots FOR SELECT
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS accommodations (
  id serial PRIMARY KEY,
  tourist_spot_id int NOT NULL REFERENCES tourist_spots(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text,
  tier text,
  price_per_night numeric(10,2),
  rating numeric(2,1) DEFAULT 0,
  amenities text[] DEFAULT '{}',
  image_url text,
  address text
);

ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_accommodations" ON accommodations;
CREATE POLICY "public_read_accommodations" ON accommodations FOR SELECT
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_districts_state_id ON districts(state_id);
CREATE INDEX IF NOT EXISTS idx_tourist_spots_district_id ON tourist_spots(district_id);
CREATE INDEX IF NOT EXISTS idx_accommodations_spot_id ON accommodations(tourist_spot_id);
