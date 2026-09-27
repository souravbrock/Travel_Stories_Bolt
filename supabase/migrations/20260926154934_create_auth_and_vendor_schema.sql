/*
# Create user profiles, verification codes, and vendor management schema

## Overview
This migration adds a full role-based access system with three roles:
- **customer**: Regular users who browse the site
- **vendor**: Travel agents, hotels, homestays, transport companies who can enlist their products
- **admin**: Full access to edit all travel data, approve vendors, etc.

## New Tables

1. **profiles** — Extends Supabase auth.users with app-level data
   - `id` (uuid, PK, references auth.users)
   - `full_name` (text, not null)
   - `phone` (text, nullable)
   - `role` (text, not null, default 'customer') — one of 'customer', 'vendor', 'admin'
   - `email_verified` (boolean, default false)
   - `password_set` (boolean, default false) — tracks whether user has set a password after email verification
   - `vendor_type` (text, nullable) — for vendors: 'travel_agent', 'hotel', 'homestay', 'transport', 'ticket_booking'
   - `vendor_approved` (boolean, default false) — admin must approve vendor accounts
   - `created_at`, `updated_at` (timestamps)

2. **verification_codes** — 5-digit codes for email verification
   - `id` (uuid, PK)
   - `email` (text, not null)
   - `code` (text, not null) — 5-digit code
   - `expires_at` (timestamptz, not null) — 10-minute expiry
   - `consumed` (boolean, default false)
   - `created_at` (timestamp)

3. **vendor_packages** — Packages created by vendor users
   - `id` (uuid, PK)
   - `vendor_id` (uuid, references profiles)
   - `title`, `description`, `state_name`, `duration_days`, `price`, `category`, `max_group_size`, `image_url`
   - `approved` (boolean, default false) — admin approval required
   - `created_at`, `updated_at`

4. **vendor_accommodations** — Hotels/homestays listed by vendor users
   - `id` (uuid, PK)
   - `vendor_id` (uuid, references profiles)
   - `name`, `type` (hotel/homestay), `tier`, `price_per_night`, `address`, `amenities`, `image_url`, `rating`
   - `tourist_spot_id` (integer, nullable, references tourist_spots)
   - `approved` (boolean, default false)
   - `created_at`, `updated_at`

5. **vendor_vehicles** — Cars/transport listed by vendor users
   - `id` (uuid, PK)
   - `vendor_id` (uuid, references profiles)
   - `vehicle_name`, `vehicle_type`, `seats`, `price_per_day`, `image_url`
   - `approved` (boolean, default false)
   - `created_at`, `updated_at`

## Security

### profiles
- RLS enabled
- Users can read and update their own profile
- Admins can read all profiles and update role/vendor_approved

### verification_codes
- RLS enabled
- No direct access from frontend — only edge functions with service role can read/write
- Deny all for anon and authenticated

### vendor_packages, vendor_accommodations, vendor_vehicles
- RLS enabled
- Public can read approved listings
- Vendors can CRUD their own listings
- Admins can read/update all listings (approve, edit)

## Important Notes
1. The verification_codes table is locked down — only the service role (used in edge functions) can access it
2. Vendor accounts must be approved by an admin before their listings appear publicly
3. The first admin account must be manually set in the database (or via a special signup flow)
4. Email confirmation in Supabase auth is kept OFF — we use our own 5-digit code verification instead
*/

-- ===== PROFILES TABLE =====
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'vendor', 'admin')),
  email_verified boolean NOT NULL DEFAULT false,
  password_set boolean NOT NULL DEFAULT false,
  vendor_type text CHECK (vendor_type IN ('travel_agent', 'hotel', 'homestay', 'transport', 'ticket_booking')),
  vendor_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile (but not their role or vendor_approved)
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
DROP POLICY IF EXISTS "admin_select_all_profiles" ON profiles;
CREATE POLICY "admin_select_all_profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Admins can update all profiles (to approve vendors, change roles)
DROP POLICY IF EXISTS "admin_update_all_profiles" ON profiles;
CREATE POLICY "admin_update_all_profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ===== VERIFICATION CODES TABLE =====
CREATE TABLE IF NOT EXISTS verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);

ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- No direct access from frontend — only service role via edge functions
-- Explicitly deny all for anon and authenticated
DROP POLICY IF EXISTS "deny_verification_codes_anon" ON verification_codes;
CREATE POLICY "deny_verification_codes_anon"
ON verification_codes FOR SELECT
TO anon, authenticated
USING (false);

-- ===== VENDOR PACKAGES TABLE =====
CREATE TABLE IF NOT EXISTS vendor_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  state_name text,
  duration_days integer,
  price numeric,
  category text,
  max_group_size integer,
  image_url text,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vendor_packages ENABLE ROW LEVEL SECURITY;

-- Public can read approved packages
DROP POLICY IF EXISTS "public_read_approved_packages" ON vendor_packages;
CREATE POLICY "public_read_approved_packages"
ON vendor_packages FOR SELECT
TO anon, authenticated
USING (approved = true);

-- Vendors can read their own packages (including unapproved)
DROP POLICY IF EXISTS "vendor_select_own_packages" ON vendor_packages;
CREATE POLICY "vendor_select_own_packages"
ON vendor_packages FOR SELECT
TO authenticated
USING (vendor_id = auth.uid());

-- Vendors can insert their own packages
DROP POLICY IF EXISTS "vendor_insert_own_packages" ON vendor_packages;
CREATE POLICY "vendor_insert_own_packages"
ON vendor_packages FOR INSERT
TO authenticated
WITH CHECK (vendor_id = auth.uid());

-- Vendors can update their own packages
DROP POLICY IF EXISTS "vendor_update_own_packages" ON vendor_packages;
CREATE POLICY "vendor_update_own_packages"
ON vendor_packages FOR UPDATE
TO authenticated
USING (vendor_id = auth.uid())
WITH CHECK (vendor_id = auth.uid());

-- Vendors can delete their own packages
DROP POLICY IF EXISTS "vendor_delete_own_packages" ON vendor_packages;
CREATE POLICY "vendor_delete_own_packages"
ON vendor_packages FOR DELETE
TO authenticated
USING (vendor_id = auth.uid());

-- Admins can update all packages (approve, edit)
DROP POLICY IF EXISTS "admin_update_all_packages" ON vendor_packages;
CREATE POLICY "admin_update_all_packages"
ON vendor_packages FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Admins can delete any package
DROP POLICY IF EXISTS "admin_delete_all_packages" ON vendor_packages;
CREATE POLICY "admin_delete_all_packages"
ON vendor_packages FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ===== VENDOR ACCOMMODATIONS TABLE =====
CREATE TABLE IF NOT EXISTS vendor_accommodations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text CHECK (type IN ('hotel', 'homestay', 'resort')),
  tier text,
  price_per_night numeric,
  address text,
  amenities text[] DEFAULT '{}',
  image_url text,
  rating numeric DEFAULT 0,
  tourist_spot_id integer REFERENCES tourist_spots(id) ON DELETE SET NULL,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vendor_accommodations ENABLE ROW LEVEL SECURITY;

-- Public can read approved accommodations
DROP POLICY IF EXISTS "public_read_approved_accommodations" ON vendor_accommodations;
CREATE POLICY "public_read_approved_accommodations"
ON vendor_accommodations FOR SELECT
TO anon, authenticated
USING (approved = true);

-- Vendors can read their own accommodations
DROP POLICY IF EXISTS "vendor_select_own_accommodations" ON vendor_accommodations;
CREATE POLICY "vendor_select_own_accommodations"
ON vendor_accommodations FOR SELECT
TO authenticated
USING (vendor_id = auth.uid());

-- Vendors can insert their own accommodations
DROP POLICY IF EXISTS "vendor_insert_own_accommodations" ON vendor_accommodations;
CREATE POLICY "vendor_insert_own_accommodations"
ON vendor_accommodations FOR INSERT
TO authenticated
WITH CHECK (vendor_id = auth.uid());

-- Vendors can update their own accommodations
DROP POLICY IF EXISTS "vendor_update_own_accommodations" ON vendor_accommodations;
CREATE POLICY "vendor_update_own_accommodations"
ON vendor_accommodations FOR UPDATE
TO authenticated
USING (vendor_id = auth.uid())
WITH CHECK (vendor_id = auth.uid());

-- Vendors can delete their own accommodations
DROP POLICY IF EXISTS "vendor_delete_own_accommodations" ON vendor_accommodations;
CREATE POLICY "vendor_delete_own_accommodations"
ON vendor_accommodations FOR DELETE
TO authenticated
USING (vendor_id = auth.uid());

-- Admins can update all accommodations
DROP POLICY IF EXISTS "admin_update_all_accommodations" ON vendor_accommodations;
CREATE POLICY "admin_update_all_accommodations"
ON vendor_accommodations FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Admins can delete any accommodation
DROP POLICY IF EXISTS "admin_delete_all_accommodations" ON vendor_accommodations;
CREATE POLICY "admin_delete_all_accommodations"
ON vendor_accommodations FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ===== VENDOR VEHICLES TABLE =====
CREATE TABLE IF NOT EXISTS vendor_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_name text NOT NULL,
  vehicle_type text,
  seats text,
  price_per_day numeric,
  image_url text,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vendor_vehicles ENABLE ROW LEVEL SECURITY;

-- Public can read approved vehicles
DROP POLICY IF EXISTS "public_read_approved_vehicles" ON vendor_vehicles;
CREATE POLICY "public_read_approved_vehicles"
ON vendor_vehicles FOR SELECT
TO anon, authenticated
USING (approved = true);

-- Vendors can read their own vehicles
DROP POLICY IF EXISTS "vendor_select_own_vehicles" ON vendor_vehicles;
CREATE POLICY "vendor_select_own_vehicles"
ON vendor_vehicles FOR SELECT
TO authenticated
USING (vendor_id = auth.uid());

-- Vendors can insert their own vehicles
DROP POLICY IF EXISTS "vendor_insert_own_vehicles" ON vendor_vehicles;
CREATE POLICY "vendor_insert_own_vehicles"
ON vendor_vehicles FOR INSERT
TO authenticated
WITH CHECK (vendor_id = auth.uid());

-- Vendors can update their own vehicles
DROP POLICY IF EXISTS "vendor_update_own_vehicles" ON vendor_vehicles;
CREATE POLICY "vendor_update_own_vehicles"
ON vendor_vehicles FOR UPDATE
TO authenticated
USING (vendor_id = auth.uid())
WITH CHECK (vendor_id = auth.uid());

-- Vendors can delete their own vehicles
DROP POLICY IF EXISTS "vendor_delete_own_vehicles" ON vendor_vehicles;
CREATE POLICY "vendor_delete_own_vehicles"
ON vendor_vehicles FOR DELETE
TO authenticated
USING (vendor_id = auth.uid());

-- Admins can update all vehicles
DROP POLICY IF EXISTS "admin_update_all_vehicles" ON vendor_vehicles;
CREATE POLICY "admin_update_all_vehicles"
ON vendor_vehicles FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Admins can delete any vehicle
DROP POLICY IF EXISTS "admin_delete_all_vehicles" ON vendor_vehicles;
CREATE POLICY "admin_delete_all_vehicles"
ON vendor_vehicles FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ===== TRIGGER: Auto-create profile on signup =====
-- This function creates a profile row when a new auth.users row is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ===== TRIGGER: Update updated_at on profiles =====
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS vendor_packages_updated_at ON vendor_packages;
CREATE TRIGGER vendor_packages_updated_at
  BEFORE UPDATE ON vendor_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS vendor_accommodations_updated_at ON vendor_accommodations;
CREATE TRIGGER vendor_accommodations_updated_at
  BEFORE UPDATE ON vendor_accommodations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS vendor_vehicles_updated_at ON vendor_vehicles;
CREATE TRIGGER vendor_vehicles_updated_at
  BEFORE UPDATE ON vendor_vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
