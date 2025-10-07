import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { tableName, query } = await req.json();

    if (!tableName) {
      return NextResponse.json(
        { error: "Table name is required" },
        { status: 400 }
      );
    }

    // Build query
    let supabaseQuery = supabaseAdmin.from(tableName).select("*");

    // Apply filters if provided
    if (query?.filters) {
      query.filters.forEach((filter: any) => {
        const { column, operator, value } = filter;
        supabaseQuery = supabaseQuery.filter(column, operator, value);
      });
    }

    // Apply ordering if provided
    if (query?.orderBy) {
      supabaseQuery = supabaseQuery.order(query.orderBy.column, {
        ascending: query.orderBy.ascending ?? true,
      });
    }

    // Apply limit if provided
    if (query?.limit) {
      supabaseQuery = supabaseQuery.limit(query.limit);
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      console.error("Query error:", error);
      return NextResponse.json(
        { error: `Query failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      rowCount: data?.length || 0,
    });
  } catch (error: any) {
    console.error("Tool error:", error);
    return NextResponse.json(
      { error: error.message || "Query failed" },
      { status: 500 }
    );
  }
}
