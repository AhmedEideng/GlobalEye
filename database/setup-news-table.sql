-- Setup News Table for GlobalEye
-- Run this script in Supabase SQL Editor

-- First, disable RLS temporarily for news table
ALTER TABLE news DISABLE ROW LEVEL SECURITY;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'news' 
ORDER BY ordinal_position;

-- Check if there are any existing articles
SELECT COUNT(*) as total_articles FROM news;

-- Re-enable RLS after setup (uncomment when ready)
-- ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for news table (optional)
-- CREATE POLICY "Enable read access for all users" ON news
-- FOR SELECT USING (true);

-- CREATE POLICY "Enable insert for authenticated users only" ON news
-- FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Enable update for authenticated users only" ON news
-- FOR UPDATE USING (auth.role() = 'authenticated'); 