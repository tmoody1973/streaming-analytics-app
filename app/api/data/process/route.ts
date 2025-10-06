import { NextRequest, NextResponse } from "next/server";
import { aggregateMetricsByPeriod, calculateAverageCUME, calculateTSL } from "@/lib/utils/radioMetrics";
import type { RadioMetrics } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, operation, period } = body;

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: "Invalid data format. Expected array of metrics." },
        { status: 400 }
      );
    }

    let result;

    switch (operation) {
      case "aggregate":
        if (!period || !["daily", "weekly", "monthly"].includes(period)) {
          return NextResponse.json(
            { error: "Invalid period. Must be 'daily', 'weekly', or 'monthly'." },
            { status: 400 }
          );
        }
        result = aggregateMetricsByPeriod(data, period);
        break;

      case "calculateCUME":
        const cumeValues = data.map((d: any) => d.cume).filter((v: number) => !isNaN(v));
        const avgCume = calculateAverageCUME(cumeValues);
        result = {
          averageCUME: avgCume,
          dataPoints: cumeValues.length,
          note: "CUME has been properly averaged (not summed) per radio industry standards",
        };
        break;

      case "calculateTSL":
        result = data.map((row: any) => ({
          ...row,
          tsl: calculateTSL(row.tlh || 0, row.cume || 0),
        }));
        break;

      case "filterByDaypart":
        const { daypart } = body;
        if (!daypart) {
          return NextResponse.json(
            { error: "Daypart parameter required" },
            { status: 400 }
          );
        }
        result = data.filter((d: RadioMetrics) =>
          d.daypart?.toLowerCase() === daypart.toLowerCase()
        );
        break;

      case "filterByDevice":
        const { device } = body;
        if (!device) {
          return NextResponse.json(
            { error: "Device parameter required" },
            { status: 400 }
          );
        }
        result = data.filter((d: RadioMetrics) =>
          d.device?.toLowerCase() === device.toLowerCase()
        );
        break;

      case "filterByDateRange":
        const { startDate, endDate } = body;
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: "startDate and endDate parameters required" },
            { status: 400 }
          );
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        result = data.filter((d: RadioMetrics) => {
          const date = new Date(d.date);
          return date >= start && date <= end;
        });
        break;

      default:
        return NextResponse.json(
          { error: `Unknown operation: ${operation}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      operation,
      resultCount: Array.isArray(result) ? result.length : 1,
      data: result,
    });
  } catch (error) {
    console.error("Processing error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Processing failed" },
      { status: 500 }
    );
  }
}
