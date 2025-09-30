-- Quick test to verify we can connect and apply the migration
-- Run this in Supabase SQL Editor

-- First, check if tables already exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('organizations', 'org_members', 'user_roles');

-- If empty, the migration hasn't been applied yet