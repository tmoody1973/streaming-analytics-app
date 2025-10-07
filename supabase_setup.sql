-- =====================================================
-- Supabase Setup SQL for Radio Milwaukee Analytics
-- =====================================================
-- Run this in your Supabase SQL Editor to enable
-- dynamic table discovery for C1 integration
-- =====================================================

-- 1. Create function to list all public tables
-- This allows the system to automatically discover uploaded CSVs
CREATE OR REPLACE FUNCTION get_public_tables()
RETURNS TABLE (
  tablename text,
  schemaname text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.tablename::text,
    t.schemaname::text
  FROM pg_tables t
  WHERE t.schemaname = 'public'
  AND t.tablename NOT IN ('spatial_ref_sys'); -- Exclude PostGIS system table
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create function to execute dynamic SQL (for table creation)
-- This allows the upload API to create tables for new CSV files
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create dashboards table (if not exists)
-- This stores your tldraw canvas states
CREATE TABLE IF NOT EXISTS public.dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Enable RLS (Row Level Security) on dashboards
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

-- 5. Create policies to allow all operations (adjust as needed for your auth)
CREATE POLICY "Allow all operations on dashboards"
  ON public.dashboards
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Verification Queries (run these to test)
-- =====================================================

-- Test 1: List all tables (should show your radio_milwaukee_* tables)
-- SELECT * FROM get_public_tables();

-- Test 2: Check dashboards table exists
-- SELECT * FROM dashboards LIMIT 1;

-- =====================================================
-- Notes
-- =====================================================
-- - get_public_tables(): Returns all tables in public schema
-- - exec_sql(): Allows creating tables dynamically from CSV uploads
-- - dashboards table: Stores your canvas snapshots
-- - RLS policies: Set to allow all operations (customize for production)
-- =====================================================
