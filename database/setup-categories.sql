-- Setup Categories for GlobalEye News
-- Run this script in Supabase SQL Editor

-- First, disable RLS temporarily for categories table (if needed)
-- ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Insert categories if they don't exist
INSERT INTO categories (name, slug, description, created_at)
VALUES 
  ('General', 'general', 'General news and current events', NOW()),
  ('Business', 'business', 'Business, economy, and financial news', NOW()),
  ('Sports', 'sports', 'Sports news and updates', NOW()),
  ('Technology', 'technology', 'Technology and innovation news', NOW()),
  ('Health', 'health', 'Health and medical news', NOW()),
  ('Science', 'science', 'Science and research news', NOW()),
  ('Entertainment', 'entertainment', 'Entertainment and celebrity news', NOW())
ON CONFLICT (slug) DO NOTHING;

-- Re-enable RLS if it was disabled
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Verify the categories were created
SELECT * FROM categories ORDER BY created_at; 