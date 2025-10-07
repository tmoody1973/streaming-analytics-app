import { NextRequest, NextResponse } from "next/server";
import { aiGenerateDashboard } from "@/lib/ai/copilotIntegration";
import type { RadioMetrics } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { fileName, data, userContext } = await request.json();

    if (!fileName || !data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: "Missing required fields: fileName and data array" },
        { status: 400 }
      );
    }

    // Convert date strings back to Date objects
    const metricsWithDates: RadioMetrics[] = data.map((item: any) => ({
      ...item,
      date: item.date ? new Date(item.date) : new Date(),
    }));

    // Generate dashboard with user context
    const dashboard = await aiGenerateDashboard(fileName, metricsWithDates, userContext);

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("Chat dashboard generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate dashboard" },
      { status: 500 }
    );
  }
}
