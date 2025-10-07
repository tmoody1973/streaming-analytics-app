import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    // Try to query the known table directly
    const knownTables = ['radio_milwaukee_daily_overview'];
    const existingTables = [];

    for (const tableName of knownTables) {
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

    console.log('Found tables:', existingTables);

    return NextResponse.json({
      success: true,
      tables: existingTables,
    });
  } catch (error: any) {
    console.error("List tables error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list tables" },
      { status: 500 }
    );
  }
}
