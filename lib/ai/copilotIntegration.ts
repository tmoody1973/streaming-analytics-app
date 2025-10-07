import { generateDashboard, analyzeData, detectDashboardType } from "./dashboardGenerator";
import type { DashboardConfiguration, RadioMetrics } from "@/types";

/**
 * CopilotKit AI Integration for Dashboard Generation
 * Uses GPT-5 to analyze CSV data and generate optimal dashboard configurations
 */

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Call OpenAI API (GPT-5) for dashboard generation
 */
export async function callOpenAI(messages: OpenAIMessage[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not found in environment variables");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-5-2025-08-07", // Using GPT-5 as requested
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

/**
 * Generate dashboard using AI analysis
 */
export async function aiGenerateDashboard(
  fileName: string,
  data: RadioMetrics[]
): Promise<DashboardConfiguration> {
  const analysis = analyzeData(data);
  const dashboardType = detectDashboardType(fileName, analysis);

  const systemPrompt = `You are an expert radio analytics dashboard designer. You understand radio industry metrics:
- CUME: Cumulative audience (always averaged, never summed)
- TLH: Total Listening Hours (can be summed)
- TSL: Time Spent Listening (TLH ÷ CUME)
- AAS: Average Active Sessions

You design beautiful, insightful dashboards using these chart types:
- line: Time series trends
- bar: Categorical comparisons
- pie: Distribution (donut chart)
- heatmap: Two-dimensional patterns
- table: Detailed data view

You respond ONLY with valid JSON, no explanations.`;

  const userPrompt = `Analyze this radio analytics CSV and design an optimal dashboard.

**File:** ${fileName}
**Type:** ${dashboardType}
**Data:**
- Rows: ${analysis.rowCount}
- Columns: ${analysis.columns.join(", ")}
- Numeric: ${analysis.numericColumns.join(", ")}
- Categories: ${analysis.categoricalColumns.join(", ")}
- Time series: ${analysis.hasTimeSeries ? "Yes" : "No"}
${analysis.dateRange ? `- Date range: ${analysis.dateRange.start.toLocaleDateString()} to ${analysis.dateRange.end.toLocaleDateString()}` : ""}

**Sample data preview:**
${JSON.stringify(data.slice(0, 3), null, 2)}

Design a dashboard with:
1. **KPIs** (3-5 cards) - Key metrics at top
2. **Charts** (3-6 visualizations) - Best charts for insights
3. **Filters** (2-4 filters) - Dimensions to filter by
4. **Insights** (2-3 insights) - Notable patterns

**Response JSON format:**
{
  "kpis": [
    {"id": "kpi1", "label": "Avg CUME", "metric": "cume", "calculation": "average", "color": "orange", "format": "number"}
  ],
  "charts": [
    {"id": "chart1", "type": "line", "title": "CUME Trend Over Time", "description": "Weekly listener growth", "dataKeys": ["cume"], "xAxis": "date"}
  ],
  "filters": [
    {"id": "filter1", "field": "station", "label": "Station", "type": "select"}
  ],
  "insights": [
    "CUME peaked at 45,000 during week of Jan 15",
    "Morning drive shows 35% higher engagement than afternoon"
  ]
}`;

  try {
    const aiResponse = await callOpenAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    // Parse AI response and generate dashboard
    const dashboard = await generateDashboard(fileName, data, async () => aiResponse);
    return dashboard;
  } catch (error) {
    console.error("AI dashboard generation failed:", error);
    // Fallback to rule-based generation
    const dashboard = await generateDashboard(fileName, data);
    return dashboard;
  }
}

/**
 * Customize existing dashboard with AI
 */
export async function aiCustomizeDashboard(
  dashboard: DashboardConfiguration,
  customizationRequest: string,
  data: RadioMetrics[]
): Promise<DashboardConfiguration> {
  const systemPrompt = `You are a dashboard customization assistant. You modify existing dashboard configurations based on user requests.

Current dashboard:
${JSON.stringify(dashboard, null, 2)}

Respond with the updated dashboard JSON. Keep the same structure, only modify what the user requests.`;

  const userPrompt = `User request: "${customizationRequest}"

Update the dashboard configuration to fulfill this request. Return complete updated JSON.`;

  try {
    const aiResponse = await callOpenAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    // Parse updated configuration
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const updated = JSON.parse(jsonMatch[0]);
      return {
        ...dashboard,
        ...updated,
        id: dashboard.id, // Keep original ID
        generatedByAI: true,
      };
    }
  } catch (error) {
    console.error("Dashboard customization failed:", error);
  }

  return dashboard; // Return unchanged on error
}

/**
 * Get AI insights about the data
 */
export async function aiGetInsights(
  data: RadioMetrics[],
  question: string
): Promise<string> {
  const analysis = analyzeData(data);

  const systemPrompt = `You are a radio analytics expert. Answer questions about radio station performance data with specific, actionable insights.

Available data:
- ${analysis.rowCount} records
- Columns: ${analysis.columns.join(", ")}
- Numeric metrics: ${analysis.numericColumns.join(", ")}
${analysis.dateRange ? `- Date range: ${analysis.dateRange.start.toLocaleDateString()} to ${analysis.dateRange.end.toLocaleDateString()}` : ""}

Sample:
${JSON.stringify(data.slice(0, 5), null, 2)}`;

  const userPrompt = question;

  try {
    const aiResponse = await callOpenAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    return aiResponse;
  } catch (error) {
    console.error("AI insights failed:", error);
    return "Sorry, I couldn't analyze the data at this time. Please try again.";
  }
}
