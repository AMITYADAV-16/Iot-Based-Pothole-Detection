/*
  # Pothole Detection System Schema

  ## Overview
  Creates the database schema for storing pothole detection data from ESP32 devices
  with MPU6050 sensors and GPS modules.

  ## New Tables
  
  ### `potholes`
  Stores detected pothole information
  - `id` (uuid, primary key) - Unique identifier for each pothole detection
  - `latitude` (numeric) - GPS latitude coordinate
  - `longitude` (numeric) - GPS longitude coordinate
  - `severity` (text) - Severity level: 'low', 'medium', 'high'
  - `g_force` (numeric) - Accelerometer reading in G-force
  - `device_id` (text) - ESP32 device identifier
  - `detected_at` (timestamptz) - Timestamp when pothole was detected
  - `created_at` (timestamptz) - Record creation timestamp
  - `address` (text, nullable) - Optional reverse-geocoded address
  - `notes` (text, nullable) - Optional notes or additional information

  ### `devices`
  Tracks ESP32 devices in the system
  - `id` (uuid, primary key) - Unique device identifier
  - `device_id` (text, unique) - Human-readable device ID
  - `name` (text) - Device name/label
  - `status` (text) - Device status: 'active', 'inactive', 'maintenance'
  - `last_seen` (timestamptz) - Last communication timestamp
  - `created_at` (timestamptz) - Device registration timestamp

  ## Security
  - Enable RLS on all tables
  - Allow public insert access for ESP32 devices to post data
  - Allow public read access for dashboard viewing
  - Restrict updates and deletes to authenticated users only

  ## Indexes
  - Index on potholes.detected_at for time-based queries
  - Index on potholes.severity for filtering
  - Spatial index on location for geographic queries
*/

-- Create potholes table
CREATE TABLE IF NOT EXISTS potholes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude numeric NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude numeric NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  g_force numeric NOT NULL CHECK (g_force >= 0),
  device_id text NOT NULL,
  detected_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  address text,
  notes text
);

-- Create devices table
CREATE TABLE IF NOT EXISTS devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text UNIQUE NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_potholes_detected_at ON potholes(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_potholes_severity ON potholes(severity);
CREATE INDEX IF NOT EXISTS idx_potholes_device_id ON potholes(device_id);
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);

-- Enable Row Level Security
ALTER TABLE potholes ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for potholes table
CREATE POLICY "Allow public read access to potholes"
  ON potholes
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert for ESP32 devices"
  ON potholes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update potholes"
  ON potholes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete potholes"
  ON potholes
  FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for devices table
CREATE POLICY "Allow public read access to devices"
  ON devices
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert for device registration"
  ON devices
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update devices"
  ON devices
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete devices"
  ON devices
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert some sample devices
INSERT INTO devices (device_id, name, status) VALUES
  ('ESP32-001', 'Vehicle Unit 1', 'active'),
  ('ESP32-002', 'Vehicle Unit 2', 'active'),
  ('ESP32-003', 'Vehicle Unit 3', 'inactive')
ON CONFLICT (device_id) DO NOTHING;

-- Insert sample pothole data for demonstration
INSERT INTO potholes (latitude, longitude, severity, g_force, device_id, detected_at) VALUES
  (40.7128, -74.0060, 'high', 2.8, 'ESP32-001', now() - interval '5 minutes'),
  (40.7138, -74.0070, 'medium', 1.9, 'ESP32-001', now() - interval '15 minutes'),
  (40.7118, -74.0050, 'low', 1.2, 'ESP32-002', now() - interval '30 minutes'),
  (40.7148, -74.0080, 'high', 3.1, 'ESP32-002', now() - interval '1 hour'),
  (40.7108, -74.0040, 'medium', 2.0, 'ESP32-001', now() - interval '2 hours'),
  (40.7158, -74.0090, 'low', 1.4, 'ESP32-003', now() - interval '3 hours'),
  (40.7098, -74.0030, 'high', 2.7, 'ESP32-001', now() - interval '4 hours'),
  (40.7168, -74.0100, 'medium', 1.8, 'ESP32-002', now() - interval '5 hours')
ON CONFLICT DO NOTHING;