import { NextRequest, NextResponse } from "next/server";
import { validateRadioMetrics } from "@/lib/utils/radioMetrics";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: "Invalid data format. Expected array of metrics." },
        { status: 400 }
      );
    }

    const validationResults = data.map((row, index) => {
      const result = validateRadioMetrics(row);
      return {
        rowIndex: index,
        ...result,
      };
    });

    const totalErrors = validationResults.filter((r) => !r.isValid).length;
    const totalWarnings = validationResults.reduce(
      (sum, r) => sum + r.warnings.length,
      0
    );

    const allErrors = validationResults
      .filter((r) => !r.isValid)
      .flatMap((r) => r.errors.map((err) => `Row ${r.rowIndex + 1}: ${err}`));

    const allWarnings = validationResults
      .filter((r) => r.warnings.length > 0)
      .flatMap((r) => r.warnings.map((warn) => `Row ${r.rowIndex + 1}: ${warn}`));

    return NextResponse.json({
      success: totalErrors === 0,
      validRecords: data.length - totalErrors,
      totalRecords: data.length,
      errorCount: totalErrors,
      warningCount: totalWarnings,
      errors: allErrors,
      warnings: allWarnings,
      details: validationResults,
    });
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Validation failed" },
      { status: 500 }
    );
  }
}
