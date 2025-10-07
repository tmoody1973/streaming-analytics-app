import { NextRequest, NextResponse } from "next/server";
import { aiCustomizeDashboard } from "@/lib/ai/copilotIntegration";
import type { DashboardConfiguration, RadioMetrics } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dashboard, customizationRequest, data } = body as {
      dashboard: DashboardConfiguration;
      customizationRequest: string;
      data?: RadioMetrics[];
    };

    if (!dashboard || !customizationRequest) {
      return NextResponse.json(
        { error: "dashboard and customizationRequest are required" },
        { status: 400 }
      );
    }

    // Customize dashboard using GPT-5
    const updatedDashboard = await aiCustomizeDashboard(
      dashboard,
      customizationRequest,
      data || []
    );

    return NextResponse.json(updatedDashboard);
  } catch (error: any) {
    console.error("Dashboard customization error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to customize dashboard" },
      { status: 500 }
    );
  }
}
