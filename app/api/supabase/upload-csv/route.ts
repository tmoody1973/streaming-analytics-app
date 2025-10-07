import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { fileName, data } = await req.json();

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "No data provided" },
        { status: 400 }
      );
    }

    // Create a clean table name from the file name
    const tableName = fileName
      .toLowerCase()
      .replace(/\.csv$/, "")
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/^(\d)/, "_$1") // Prefix with _ if starts with number
      .substring(0, 63); // Postgres table name limit

    // Get the first row to determine columns
    const firstRow = data[0];
    const columns = Object.keys(firstRow);

    // Check if table already exists by trying to query it
    let tableExists = false;
    try {
      const { error: checkError } = await supabaseAdmin
        .from(tableName)
        .select('id')
        .limit(1);

      tableExists = !checkError;
    } catch (error) {
      tableExists = false;
    }

    // Only create table if it doesn't exist
    if (!tableExists) {
      // Create table schema - infer types from data
      const columnDefinitions = columns
        .map((col) => {
          const cleanCol = col.toLowerCase().replace(/[^a-z0-9_]/g, "_");
          const sampleValue = firstRow[col];

          // Infer type from sample value
          let type = "text";
          if (sampleValue !== null && sampleValue !== undefined && sampleValue !== "") {
            if (!isNaN(Number(sampleValue))) {
              type = "numeric";
            } else if (!isNaN(Date.parse(sampleValue))) {
              type = "timestamp";
            }
          }

          return `"${cleanCol}" ${type}`;
        })
        .join(", ");

      // Create the table (only if it doesn't exist)
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS "${tableName}" (
          id BIGSERIAL PRIMARY KEY,
          ${columnDefinitions},
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
        );
      `;

      // Execute SQL using Supabase admin
      let createError: any;
      try {
        const result = await supabaseAdmin.rpc("exec_sql", {
          sql: createTableSQL
        });
        createError = result.error;
      } catch (error: any) {
        // If exec_sql function doesn't exist, try to create it
        try {
          await supabaseAdmin.rpc("create_exec_sql_function");
          const result = await supabaseAdmin.rpc("exec_sql", { sql: createTableSQL });
          createError = result.error;
        } catch (retryError) {
          createError = retryError;
        }
      }

      if (createError) {
        console.error("Error creating table:", createError);
        return NextResponse.json(
          { error: `Failed to create table: ${createError.message || 'Unknown error'}` },
          { status: 500 }
        );
      }

      console.log(`Created new table: ${tableName}`);
    } else {
      console.log(`Table ${tableName} already exists, appending data...`);
    }

    // Insert data
    const cleanedData = data.map((row: any) => {
      const cleanRow: any = {};
      columns.forEach((col) => {
        const cleanCol = col.toLowerCase().replace(/[^a-z0-9_]/g, "_");
        let value = row[col];

        // Clean and convert values
        if (value === null || value === undefined || value === "") {
          cleanRow[cleanCol] = null;
        } else if (!isNaN(Number(value))) {
          cleanRow[cleanCol] = Number(value);
        } else {
          cleanRow[cleanCol] = String(value);
        }
      });
      return cleanRow;
    });

    const { error: insertError } = await supabaseAdmin
      .from(tableName)
      .insert(cleanedData);

    if (insertError) {
      console.error("Error inserting data:", insertError);
      return NextResponse.json(
        { error: `Failed to insert data: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Get total row count in the table
    const { count } = await supabaseAdmin
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      tableName,
      rowsAdded: data.length,
      totalRows: count || data.length,
      isNewTable: !tableExists,
      columns: columns,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload CSV" },
      { status: 500 }
    );
  }
}
