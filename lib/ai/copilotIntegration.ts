import { analyzeData, detectDashboardType } from "./dashboardGenerator";
import type { DashboardConfiguration, RadioMetrics, ChartSpecification, KPISpecification, FilterSpecification } from "@/types";
import {
  CHART_FUNCTIONS,
  type LineChartArgs,
  type BarChartArgs,
  type PieChartArgs,
  type HeatmapArgs,
  type TableArgs,
  type KPIArgs,
  type FilterArgs,
  type InsightArgs
} from "./chartFunctions";

/**
 * CopilotKit AI Integration with Function Calling
 * Uses GPT-5 with function calling for reliable dashboard generation
 */

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

/**
 * Call OpenAI API (GPT-5) with function calling
 */
export async function callOpenAIWithFunctions(
  messages: OpenAIMessage[],
  tools: any[]
): Promise<{ content: string | null; tool_calls?: ToolCall[] }> {
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
      model: "gpt-4o", // Using GPT-4o for function calling (GPT-5 when available)
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  const message = data.choices[0]?.message;

  return {
    content: message.content,
    tool_calls: message.tool_calls,
  };
}

/**
 * Process tool calls into dashboard configuration
 */
function processToolCalls(toolCalls: ToolCall[]): {
  charts: ChartSpecification[];
  kpis: KPISpecification[];
  filters: FilterSpecification[];
  insights: string[];
} {
  const charts: ChartSpecification[] = [];
  const kpis: KPISpecification[] = [];
  const filters: FilterSpecification[] = [];
  const insights: string[] = [];

  toolCalls.forEach((call) => {
    const args = JSON.parse(call.function.arguments);

    switch (call.function.name) {
      case "create_line_chart": {
        const lineArgs = args as LineChartArgs;
        charts.push({
          id: call.id,
          type: "line",
          title: lineArgs.title,
          description: lineArgs.description,
          dataKeys: lineArgs.metrics,
          xAxis: lineArgs.xAxis,
        });
        break;
      }

      case "create_bar_chart": {
        const barArgs = args as BarChartArgs;
        charts.push({
          id: call.id,
          type: "bar",
          title: barArgs.title,
          description: barArgs.description,
          dataKeys: barArgs.metrics,
          xAxis: barArgs.xAxis,
        });
        break;
      }

      case "create_pie_chart": {
        const pieArgs = args as PieChartArgs;
        charts.push({
          id: call.id,
          type: "pie",
          title: pieArgs.title,
          description: pieArgs.description,
          dataKeys: [pieArgs.metric],
          xAxis: pieArgs.groupBy,
        });
        break;
      }

      case "create_heatmap": {
        const heatArgs = args as HeatmapArgs;
        charts.push({
          id: call.id,
          type: "heatmap",
          title: heatArgs.title,
          description: heatArgs.description,
          dataKeys: [heatArgs.metric],
          xAxis: heatArgs.xAxis,
          yAxis: heatArgs.yAxis,
        });
        break;
      }

      case "create_table": {
        const tableArgs = args as TableArgs;
        charts.push({
          id: call.id,
          type: "table",
          title: tableArgs.title,
          description: tableArgs.description,
          dataKeys: tableArgs.columns,
        });
        break;
      }

      case "create_kpi_card": {
        const kpiArgs = args as KPIArgs;
        kpis.push({
          id: call.id,
          label: kpiArgs.label,
          metric: kpiArgs.metric,
          calculation: kpiArgs.calculation,
          format: kpiArgs.format || "number",
          color: kpiArgs.color || "orange",
        });
        break;
      }

      case "create_filter": {
        const filterArgs = args as FilterArgs;
        filters.push({
          id: call.id,
          field: filterArgs.field,
          label: filterArgs.label,
          type: filterArgs.type,
        });
        break;
      }

      case "add_insight": {
        const insightArgs = args as InsightArgs;
        insights.push(insightArgs.insight);
        break;
      }
    }
  });

  return { charts, kpis, filters, insights };
}

/**
 * Generate dashboard using AI with function calling
 */
export async function aiGenerateDashboard(
  fileName: string,
  data: RadioMetrics[],
  userContext?: string
): Promise<DashboardConfiguration> {
  const analysis = analyzeData(data);
  const dashboardType = detectDashboardType(fileName, analysis);

  const systemPrompt = `You are a radio analytics expert creating dashboards for Radio Milwaukee.

**Radio Metrics:**
- CUME: Cumulative audience (always averaged, never summed)
- TLH: Total Listening Hours (can be summed)
- TSL: Time Spent Listening (TLH ÷ CUME)
- AAS: Average Active Sessions

**Your task:** Analyze the data and call functions to build an optimal dashboard.

**Guidelines:**
1. Create 4-6 KPI cards highlighting key metrics
2. Create 6-8 charts showing DIFFERENT insights (trends, comparisons, distributions, patterns, correlations, hourly breakdown)
3. Add 2-4 filters for interactivity
4. Add 3-5 insights about notable patterns

**Chart selection:**
- Line charts: Time series, trends
- Bar charts: Comparisons, rankings
- Pie charts: Distribution (max 8 segments)
- Heatmaps: Two-dimensional patterns
- Tables: Detailed data views

**IMPORTANT:** Each chart should show a DIFFERENT aspect of the data. Vary your analysis across:
- Temporal trends (line charts over time)
- Category comparisons (bar charts by station/device)
- Distribution breakdowns (pie charts)
- Pattern detection (heatmaps for hourly/daypart)
- Detailed views (tables for raw data)

Call multiple functions to build the complete dashboard.`;

  const contextSection = userContext
    ? `\n**User's Request:** "${userContext}"\nPrioritize charts and insights that address this request.`
    : "";

  const userPrompt = `**File:** ${fileName}
**Dashboard Type:** ${dashboardType}

**Data Summary:**
- Rows: ${analysis.rowCount}
- Columns: ${analysis.columns.join(", ")}
- Numeric: ${analysis.numericColumns.join(", ")}
- Categories: ${analysis.categoricalColumns.join(", ")}
- Time series: ${analysis.hasTimeSeries ? "Yes" : "No"}
${analysis.dateRange ? `- Date range: ${analysis.dateRange.start.toLocaleDateString()} to ${analysis.dateRange.end.toLocaleDateString()}` : ""}${contextSection}

Analyze this radio analytics data and create an optimal dashboard by calling the appropriate functions.`;

  try {
    const response = await callOpenAIWithFunctions(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      CHART_FUNCTIONS
    );

    if (!response.tool_calls || response.tool_calls.length === 0) {
      throw new Error("No tool calls returned from AI");
    }

    const { charts, kpis, filters, insights } = processToolCalls(response.tool_calls);

    return {
      id: `dashboard_${Date.now()}`,
      name: fileName.replace(/\.csv$/i, ""),
      type: dashboardType,
      csvFileName: fileName,
      charts: charts.length > 0 ? charts : getDefaultCharts(),
      kpis: kpis.length > 0 ? kpis : getDefaultKPIs(),
      filters: filters.length > 0 ? filters : getDefaultFilters(),
      createdAt: new Date(),
      generatedByAI: true,
      aiInsights: insights,
    };
  } catch (error) {
    console.error("AI dashboard generation failed:", error);
    // Fallback to default configuration
    return {
      id: `dashboard_${Date.now()}`,
      name: fileName.replace(/\.csv$/i, ""),
      type: dashboardType,
      csvFileName: fileName,
      charts: getDefaultCharts(),
      kpis: getDefaultKPIs(),
      filters: getDefaultFilters(),
      createdAt: new Date(),
      generatedByAI: false,
      aiInsights: [],
    };
  }
}

/**
 * Fallback configurations
 */
function getDefaultCharts(): ChartSpecification[] {
  return [
    {
      id: "chart1",
      type: "line",
      title: "Metrics Over Time",
      dataKeys: ["cume", "tlh"],
      xAxis: "date",
    },
    {
      id: "chart2",
      type: "bar",
      title: "Station Comparison",
      dataKeys: ["cume"],
      xAxis: "station",
    },
  ];
}

function getDefaultKPIs(): KPISpecification[] {
  return [
    { id: "kpi1", label: "Avg CUME", metric: "cume", calculation: "average", color: "orange" },
    { id: "kpi2", label: "Total TLH", metric: "tlh", calculation: "sum", color: "blue" },
    { id: "kpi3", label: "Avg TSL", metric: "tsl", calculation: "average", color: "blue" },
  ];
}

function getDefaultFilters(): FilterSpecification[] {
  return [
    { id: "filter1", field: "station", label: "Station", type: "select" },
    { id: "filter2", field: "date", label: "Date Range", type: "date" },
  ];
}

/**
 * Customize existing dashboard with AI (using function calling)
 */
export async function aiCustomizeDashboard(
  dashboard: DashboardConfiguration,
  customizationRequest: string,
  data: RadioMetrics[]
): Promise<DashboardConfiguration> {
  const systemPrompt = `You are customizing a radio analytics dashboard based on user requests.

Current dashboard has:
- ${dashboard.kpis.length} KPI cards
- ${dashboard.charts.length} charts
- ${dashboard.filters.length} filters

Modify the dashboard by calling functions to add/update/replace components.`;

  const userPrompt = `Current config:
KPIs: ${dashboard.kpis.map((k) => k.label).join(", ")}
Charts: ${dashboard.charts.map((c) => c.title).join(", ")}

**User request:** "${customizationRequest}"

Call the appropriate functions to fulfill this request.`;

  try {
    const response = await callOpenAIWithFunctions(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      CHART_FUNCTIONS
    );

    if (!response.tool_calls) {
      return dashboard;
    }

    const { charts, kpis, filters, insights } = processToolCalls(response.tool_calls);

    // Merge with existing config
    return {
      ...dashboard,
      charts: charts.length > 0 ? [...dashboard.charts, ...charts] : dashboard.charts,
      kpis: kpis.length > 0 ? [...dashboard.kpis, ...kpis] : dashboard.kpis,
      filters: filters.length > 0 ? [...dashboard.filters, ...filters] : dashboard.filters,
      aiInsights: [...(dashboard.aiInsights || []), ...insights],
      generatedByAI: true,
    };
  } catch (error) {
    console.error("Dashboard customization failed:", error);
    return dashboard;
  }
}

/**
 * Get AI insights about data (using function calling)
 */
export async function aiGetInsights(data: RadioMetrics[], question: string): Promise<string> {
  const analysis = analyzeData(data);

  const systemPrompt = `You are a radio analytics expert. Answer questions with specific insights using the add_insight function.`;

  const userPrompt = `Data: ${analysis.rowCount} records, ${analysis.columns.join(", ")}

Question: ${question}

Call add_insight with a concise, specific answer.`;

  try {
    const response = await callOpenAIWithFunctions(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      CHART_FUNCTIONS
    );

    if (response.tool_calls && response.tool_calls.length > 0) {
      const insightCall = response.tool_calls.find((c) => c.function.name === "add_insight");
      if (insightCall) {
        const args = JSON.parse(insightCall.function.arguments) as InsightArgs;
        return args.insight;
      }
    }

    return response.content || "Unable to provide insights at this time.";
  } catch (error) {
    console.error("AI insights failed:", error);
    return "Sorry, I couldn't analyze the data at this time.";
  }
}
