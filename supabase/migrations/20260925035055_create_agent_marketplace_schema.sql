/*
# Travel Agent Marketplace Schema

## Overview
Adds the travel agent marketplace tables to support browsing, comparing,
and inquiring about curated tour packages published by verified travel agents.

This is a public-content, no-auth discovery app: all data is browsable by anyone.

## New Tables

### travel_agents
- `id` (serial, primary key)
- `name` (text, not null) — agent/company name
- `logo_url` (text) — agent logo
- `verified` (boolean, default true) — verification badge
- `rating` (numeric, default 0) — 0-5 average rating
- `description` (text) — about the agent
- `contact_email` (text) — for inquiries
- `contact_phone` (text) — for inquiries

### travel_packages
- `id` (serial, primary key)
- `agent_id` (int, references travel_agents)
- `title` (text, not null) — package name
- `slug` (text, unique) — URL-safe slug
- `description` (text) — detailed description
- `state_name` (text) — which state this package covers
- `duration_days` (int) — trip duration
- `price` (numeric) — starting price in INR
- `inclusions` (text[]) — what's included
- `exclusions` (text[]) — what's not included
- `itinerary` (text[]) — day-by-day summary
- `image_url` (text) — hero image
- `rating` (numeric, default 0) — 0-5
- `category` (text) — e.g. "Heritage", "Beach", "Adventure", "Honeymoon"
- `max_group_size` (int) — max travelers

## Security
- RLS enabled on all tables.
- Public read access (anon + authenticated) — no-auth discovery app.
*/

CREATE TABLE IF NOT EXISTS travel_agents (
  id serial PRIMARY KEY,
  name text NOT NULL,
  logo_url text,
  verified boolean NOT NULL DEFAULT true,
  rating numeric(2,1) DEFAULT 0,
  description text,
  contact_email text,
  contact_phone text
);

ALTER TABLE travel_agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_travel_agents" ON travel_agents;
CREATE POLICY "public_read_travel_agents" ON travel_agents FOR SELECT
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS travel_packages (
  id serial PRIMARY KEY,
  agent_id int NOT NULL REFERENCES travel_agents(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  state_name text,
  duration_days int,
  price numeric(10,2),
  inclusions text[] DEFAULT '{}',
  exclusions text[] DEFAULT '{}',
  itinerary text[] DEFAULT '{}',
  image_url text,
  rating numeric(2,1) DEFAULT 0,
  category text,
  max_group_size int
);

ALTER TABLE travel_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_travel_packages" ON travel_packages;
CREATE POLICY "public_read_travel_packages" ON travel_packages FOR SELECT
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_packages_agent_id ON travel_packages(agent_id);
CREATE INDEX IF NOT EXISTS idx_packages_category ON travel_packages(category);
CREATE INDEX IF NOT EXISTS idx_packages_state ON travel_packages(state_name);
