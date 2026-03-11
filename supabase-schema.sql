-- Book Learner Database Schema
-- Run this in your Supabase SQL editor

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Highlights table
CREATE TABLE IF NOT EXISTS highlights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  book_name TEXT NOT NULL,
  page_number INTEGER,
  quote TEXT NOT NULL,
  category TEXT NOT NULL,
  why_this_matters TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DeepDive table
CREATE TABLE IF NOT EXISTS deep_dives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  highlight_id UUID NOT NULL REFERENCES highlights(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  context TEXT NOT NULL,
  explanation TEXT NOT NULL,
  examples TEXT NOT NULL,
  why_it_matters TEXT NOT NULL,
  memory_reinforcement TEXT NOT NULL,
  sources TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed some default categories
INSERT INTO categories (name) VALUES
  ('Philosophy'),
  ('Psychology'),
  ('Science'),
  ('History'),
  ('Literature'),
  ('Business'),
  ('Self-Development'),
  ('Technology'),
  ('Art & Creativity'),
  ('Spirituality')
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security (optional, remove if not needed)
-- ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE deep_dives ENABLE ROW LEVEL SECURITY;
