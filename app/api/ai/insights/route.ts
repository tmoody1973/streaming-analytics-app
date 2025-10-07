import { NextRequest, NextResponse } from "next/server";
import { aiGetInsights } from "@/lib/ai/copilotIntegration";
import type { RadioMetrics } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, data } = body as { question: string; data?: RadioMetrics[] };

    if (!question) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    // Get AI insights using GPT-5
    const insight = await aiGetInsights(data || [], question);

    return NextResponse.json({ insight });
  } catch (error: any) {
    console.error("Insights error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get insights" },
      { status: 500 }
    );
  }
}
