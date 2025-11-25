-- Create beta_waitlist table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS beta_waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups and unique constraint
CREATE INDEX IF NOT EXISTS idx_beta_waitlist_email ON beta_waitlist(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_beta_waitlist_created_at ON beta_waitlist(created_at DESC);

-- Enable Row Level Security
ALTER TABLE beta_waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anyone (anonymous users can sign up)
CREATE POLICY "Allow public inserts" ON beta_waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to read all records
CREATE POLICY "Allow authenticated reads" ON beta_waitlist
  FOR SELECT
  TO authenticated
  USING (true);

-- Optional: Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_beta_waitlist_updated_at BEFORE UPDATE
  ON beta_waitlist FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
