import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    // Query Supabase for all tables that start with "radio_milwaukee_"
    // This dynamically discovers all uploaded CSV tables
    const { data, error } = await supabaseAdmin.rpc('get_public_tables');

    if (error) {
      // Fallback to hardcoded list if RPC doesn't exist
      console.log("RPC not available, using fallback method");

      // Try to query all known tables
      const potentialTables = [
        'radio_milwaukee_daily_overview',
        'radio_milwaukee_device_analysis',
        'radio_milwaukee_hourly_patterns',
      ];

      const existingTables = [];

      for (const tableName of potentialTables) {
        try {
          const { error } = await supabaseAdmin
            .from(tableName)
            .select('id')
            .limit(1);

          if (!error) {
            existingTables.push(tableName);
          }
        } catch (e) {
          // Table doesn't exist, skip
        }
      }

      console.log('Found tables (fallback):', existingTables);

      return NextResponse.json({
        success: true,
        tables: existingTables,
      });
    }

    // Filter for radio_milwaukee_ tables from RPC result
    const radioTables = data
      .filter((table: any) => table.tablename?.startsWith('radio_milwaukee_'))
      .map((table: any) => table.tablename);

    console.log('Found tables (dynamic):', radioTables);

    return NextResponse.json({
      success: true,
      tables: radioTables,
    });
  } catch (error: any) {
    console.error("List tables error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list tables" },
      { status: 500 }
    );
  }
}
