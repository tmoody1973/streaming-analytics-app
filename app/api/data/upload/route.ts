import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { detectCSVType, detectExportType, parseTritonMetrics, parseNielsenMetrics } from "@/lib/utils/radioMetrics";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "Only CSV files are supported" },
        { status: 400 }
      );
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit" },
        { status: 400 }
      );
    }

    // Read file content
    const text = await file.text();

    // Parse CSV
    const parseResult = await new Promise<Papa.ParseResult<any>>((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        dynamicTyping: false, // Keep as strings initially for better validation
        skipEmptyLines: true,
        complete: resolve,
        error: reject,
      });
    });

    if (parseResult.errors.length > 0) {
      const errorMessages = parseResult.errors
        .map((err) => `Row ${err.row}: ${err.message}`)
        .join("; ");
      return NextResponse.json(
        { error: `CSV parsing errors: ${errorMessages}` },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    if (data.length === 0) {
      return NextResponse.json(
        { error: "CSV file is empty" },
        { status: 400 }
      );
    }

    // Detect data type
    const headers = Object.keys(data[0]);
    const dataType = detectCSVType(headers);
    const exportType = detectExportType(headers, file.name);

    console.log(`Detected export type: ${exportType.type} (category: ${exportType.category})`);
    console.log(`Has station: ${exportType.hasStation}, daypart: ${exportType.hasDaypart}, device: ${exportType.hasDevice}`);

    if (dataType === "unknown") {
      return NextResponse.json(
        {
          error: "Unable to detect data format. Expected Triton Webcast or Nielsen format with CUME and TLH columns.",
          headers: headers,
        },
        { status: 400 }
      );
    }

    // Process based on type
    let processedMetrics: any[] = [];
    let recordCount = 0;

    try {
      if (dataType === "triton") {
        processedMetrics = parseTritonMetrics(data);
        recordCount = processedMetrics.length;
      } else if (dataType === "nielsen") {
        processedMetrics = parseNielsenMetrics(data);
        recordCount = processedMetrics.length;
      }

      if (recordCount === 0) {
        return NextResponse.json(
          { error: "No valid records found in CSV. Check data format and required columns (CUME, TLH)." },
          { status: 400 }
        );
      }

      // Calculate summary statistics
      const cumeValues = processedMetrics.map((m: any) => m.cume).filter((v: number) => v > 0);
      const avgCume = cumeValues.length > 0
        ? Math.round(cumeValues.reduce((a: number, b: number) => a + b, 0) / cumeValues.length)
        : 0;

      const totalTlh = processedMetrics.reduce((sum: number, m: any) => sum + m.tlh, 0);

      // Store processed data in Supabase
      const tableName = file.name
        .toLowerCase()
        .replace(/\.csv$/, "")
        .replace(/[^a-z0-9_]/g, "_")
        .replace(/^(\d)/, "_$1") // Prefix with _ if starts with number
        .substring(0, 63); // Postgres table name limit

      try {
        // Create table and insert data via Supabase
        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/supabase/upload-csv`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            data: processedMetrics,
          }),
        });

        if (!uploadResponse.ok) {
          console.error("Failed to store data in Supabase:", await uploadResponse.text());
          // Continue anyway - we can still return the processed data
        } else {
          const uploadData = await uploadResponse.json();
          console.log(`Stored ${uploadData.rowCount} rows in table: ${uploadData.tableName}`);
        }
      } catch (supabaseError) {
        console.error("Error storing data in Supabase:", supabaseError);
        // Continue anyway - we can still return the processed data
      }

      return NextResponse.json({
        success: true,
        id: crypto.randomUUID(),
        type: dataType,
        exportType: exportType.type, // Specific export type (Daily Overview, Daypart Performance, etc.)
        category: exportType.category, // Category (daily, daypart, device, etc.)
        recordCount,
        fileName: file.name,
        fileSize: file.size,
        tableName, // Include the table name for reference
        summary: {
          avgCume,
          totalTlh: Math.round(totalTlh),
          dateRange: {
            start: processedMetrics[0]?.date,
            end: processedMetrics[processedMetrics.length - 1]?.date,
          },
        },
        data: processedMetrics, // Return processed data
      });
    } catch (processingError) {
      console.error("Error processing metrics:", processingError);
      return NextResponse.json(
        { error: `Data processing error: ${processingError instanceof Error ? processingError.message : "Unknown error"}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
