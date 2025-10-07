-- =====================================================
-- Fix RPC Permissions for get_public_tables()
-- =====================================================
-- The function exists and works, but the API can't call it
-- This grants the necessary permissions
-- =====================================================

-- Grant execute permission to all API roles
GRANT EXECUTE ON FUNCTION get_public_tables() TO anon;
GRANT EXECUTE ON FUNCTION get_public_tables() TO authenticated;
GRANT EXECUTE ON FUNCTION get_public_tables() TO service_role;

-- Verify it works (should return your tables)
SELECT * FROM get_public_tables();

-- =====================================================
-- Expected Result:
-- =====================================================
-- tablename                          | schemaname
-- -----------------------------------|------------
-- radio_milwaukee_daily_overview     | public
-- radio_milwaukee_device_analysis    | public
-- radio_milwaukee_hourly_patterns    | public
-- dashboards                         | public
-- =====================================================
