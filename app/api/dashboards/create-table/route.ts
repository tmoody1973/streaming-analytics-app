import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST() {
  try {
    // Create dashboards table
    const { error } = await supabaseAdmin.rpc('create_dashboards_table');

    if (error) {
      // If RPC doesn't exist, create table directly with SQL
      const { error: sqlError } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS dashboards (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            snapshot JSONB NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );

          -- Create index for faster lookups
          CREATE INDEX IF NOT EXISTS idx_dashboards_updated_at ON dashboards(updated_at DESC);
        `
      });

      if (sqlError) {
        console.error("SQL Error:", sqlError);
        throw sqlError;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Dashboards table created successfully"
    });
  } catch (error: any) {
    console.error("Error creating dashboards table:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
