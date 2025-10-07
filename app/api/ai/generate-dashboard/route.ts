import { NextRequest, NextResponse } from "next/server";
import { aiGenerateDashboard } from "@/lib/ai/copilotIntegration";
import type { RadioMetrics } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, data } = body as { fileName: string; data: RadioMetrics[] };

    if (!fileName || !data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: "fileName and data array are required" },
        { status: 400 }
      );
    }

    // Generate dashboard using GPT-5
    const dashboard = await aiGenerateDashboard(fileName, data);

    return NextResponse.json(dashboard);
  } catch (error: any) {
    console.error("Dashboard generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate dashboard" },
      { status: 500 }
    );
  }
}
