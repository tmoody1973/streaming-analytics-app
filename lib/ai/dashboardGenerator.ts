import type {
  DashboardConfiguration,
  ChartSpecification,
  KPISpecification,
  FilterSpecification,
  RadioMetrics,
  DashboardType
} from "@/types";

/**
 * AI Dashboard Generator
 * Analyzes CSV data and generates optimal dashboard configurations
 */

export interface DataAnalysis {
  columns: string[];
  columnTypes: Record<string, "string" | "number" | "date">;
  uniqueValues: Record<string, string[]>;
  hasTimeSeries: boolean;
  timeColumn?: string;
  numericColumns: string[];
  categoricalColumns: string[];
  rowCount: number;
  dateRange?: { start: Date; end: Date };
}

/**
 * Analyze CSV data structure
 */
export function analyzeData(data: RadioMetrics[]): DataAnalysis {
  if (data.length === 0) {
    return {
      columns: [],
      columnTypes: {},
      uniqueValues: {},
      hasTimeSeries: false,
      numericColumns: [],
      categoricalColumns: [],
      rowCount: 0,
    };
  }

  const sample = data[0];
  const columns = Object.keys(sample);
  const columnTypes: Record<string, "string" | "number" | "date"> = {};
  const uniqueValues: Record<string, string[]> = {};
  const numericColumns: string[] = [];
  const categoricalColumns: string[] = [];

  // Analyze each column
  columns.forEach((col) => {
    const values = data.map((row) => (row as any)[col]).filter((v) => v != null);
    const uniqueVals = [...new Set(values.map(String))];

    uniqueValues[col] = uniqueVals.slice(0, 100); // Limit to 100 unique values

    // Determine type
    if (sample[col as keyof RadioMetrics] instanceof Date) {
      columnTypes[col] = "date";
    } else if (typeof sample[col as keyof RadioMetrics] === "number") {
      columnTypes[col] = "number";
      numericColumns.push(col);
    } else {
      columnTypes[col] = "string";
      if (uniqueVals.length < 50) { // Categorical if < 50 unique values
        categoricalColumns.push(col);
      }
    }
  });

  // Check for time series
  const hasTimeSeries = columnTypes["date"] === "date" || columns.includes("date");
  const timeColumn = hasTimeSeries ? "date" : undefined;

  // Get date range
  let dateRange: { start: Date; end: Date } | undefined;
  if (hasTimeSeries && data.length > 0) {
    const dates = data
      .map((d) => d.date)
      .filter(Boolean)
      .map((d) => (d instanceof Date ? d : new Date(d)));

    if (dates.length > 0) {
      dateRange = {
        start: new Date(Math.min(...dates.map((d) => d.getTime()))),
        end: new Date(Math.max(...dates.map((d) => d.getTime()))),
      };
    }
  }

  return {
    columns,
    columnTypes,
    uniqueValues,
    hasTimeSeries,
    timeColumn,
    numericColumns,
    categoricalColumns,
    rowCount: data.length,
    dateRange,
  };
}

/**
 * Detect dashboard type from filename and data structure
 */
export function detectDashboardType(fileName: string, analysis: DataAnalysis): DashboardType {
  const lower = fileName.toLowerCase();

  if (lower.includes("daily") || lower.includes("overview")) {
    return "daily_overview";
  }
  if (lower.includes("device") || lower.includes("platform")) {
    return "device_analysis";
  }
  if (lower.includes("hourly") || lower.includes("hour")) {
    return "hourly_patterns";
  }
  if (lower.includes("daypart")) {
    return "daypart_performance";
  }

  return "custom";
}

/**
 * Create AI prompt for dashboard generation
 */
export function createDashboardPrompt(
  fileName: string,
  analysis: DataAnalysis,
  dashboardType: DashboardType
): string {
  return `You are a radio analytics expert. Analyze this CSV data and generate an optimal dashboard configuration.

**File Name:** ${fileName}
**Dashboard Type:** ${dashboardType}
**Data Summary:**
- Rows: ${analysis.rowCount}
- Columns: ${analysis.columns.join(", ")}
- Numeric metrics: ${analysis.numericColumns.join(", ")}
- Categorical dimensions: ${analysis.categoricalColumns.join(", ")}
- Time series: ${analysis.hasTimeSeries ? "Yes" : "No"}
${analysis.dateRange ? `- Date range: ${analysis.dateRange.start.toLocaleDateString()} to ${analysis.dateRange.end.toLocaleDateString()}` : ""}

**Radio Metrics Context:**
- CUME: Cumulative audience (always averaged, never summed)
- TLH: Total Listening Hours (can be summed)
- TSL: Time Spent Listening (TLH ÷ CUME)
- AAS: Average Active Sessions

**Your Task:**
Generate a JSON dashboard configuration with:
1. **KPIs** (3-5 key performance indicators) - which metrics to highlight at the top
2. **Charts** (3-6 visualizations) - best chart types for this data
3. **Filters** (2-4 filters) - which dimensions users should filter by
4. **Insights** (2-3 insights) - notable patterns or recommendations

**Chart Types Available:**
- line: Time series trends
- bar: Comparisons across categories
- pie: Distribution/composition
- area: Cumulative trends
- table: Detailed data view
- heatmap: Two-dimensional patterns

**Response Format (JSON only, no explanation):**
{
  "kpis": [
    {"id": "kpi1", "label": "Avg CUME", "metric": "cume", "calculation": "average", "color": "orange"},
    ...
  ],
  "charts": [
    {"id": "chart1", "type": "line", "title": "CUME Trend", "dataKeys": ["cume"], "xAxis": "date"},
    ...
  ],
  "filters": [
    {"id": "filter1", "field": "station", "label": "Station", "type": "select"},
    ...
  ],
  "insights": [
    "CUME peaked during morning drive hours (6-10 AM)",
    ...
  ]
}`;
}

/**
 * Parse AI response into dashboard configuration
 */
export function parseAIResponse(
  aiResponse: string,
  fileName: string,
  dashboardType: DashboardType
): Partial<DashboardConfiguration> {
  try {
    // Extract JSON from response (in case AI adds explanation)
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      name: fileName.replace(/\.csv$/i, ""),
      type: dashboardType,
      csvFileName: fileName,
      charts: parsed.charts || [],
      kpis: parsed.kpis || [],
      filters: parsed.filters || [],
      generatedByAI: true,
      aiInsights: parsed.insights || [],
    };
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    // Return fallback configuration
    return createFallbackDashboard(fileName, dashboardType);
  }
}

/**
 * Fallback dashboard if AI generation fails
 */
function createFallbackDashboard(
  fileName: string,
  dashboardType: DashboardType
): Partial<DashboardConfiguration> {
  const kpis: KPISpecification[] = [
    { id: "kpi1", label: "Avg CUME", metric: "cume", calculation: "average", color: "orange" },
    { id: "kpi2", label: "Total TLH", metric: "tlh", calculation: "sum", color: "blue" },
    { id: "kpi3", label: "Avg TSL", metric: "tsl", calculation: "average", color: "blue" },
  ];

  const charts: ChartSpecification[] = [
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

  const filters: FilterSpecification[] = [
    { id: "filter1", field: "station", label: "Station", type: "select" },
    { id: "filter2", field: "date", label: "Date Range", type: "date" },
  ];

  return {
    name: fileName.replace(/\.csv$/i, ""),
    type: dashboardType,
    csvFileName: fileName,
    charts,
    kpis,
    filters,
    generatedByAI: false,
    aiInsights: [],
  };
}

/**
 * Generate complete dashboard configuration
 */
export async function generateDashboard(
  fileName: string,
  data: RadioMetrics[],
  aiGenerateFunction?: (prompt: string) => Promise<string>
): Promise<DashboardConfiguration> {
  const analysis = analyzeData(data);
  const dashboardType = detectDashboardType(fileName, analysis);

  let config: Partial<DashboardConfiguration>;

  if (aiGenerateFunction) {
    try {
      const prompt = createDashboardPrompt(fileName, analysis, dashboardType);
      const aiResponse = await aiGenerateFunction(prompt);
      config = parseAIResponse(aiResponse, fileName, dashboardType);
    } catch (error) {
      console.error("AI generation failed, using fallback:", error);
      config = createFallbackDashboard(fileName, dashboardType);
    }
  } else {
    config = createFallbackDashboard(fileName, dashboardType);
  }

  return {
    id: `dashboard_${Date.now()}`,
    name: config.name || fileName,
    type: config.type || dashboardType,
    csvFileName: fileName,
    charts: config.charts || [],
    kpis: config.kpis || [],
    filters: config.filters || [],
    createdAt: new Date(),
    generatedByAI: config.generatedByAI || false,
    aiInsights: config.aiInsights || [],
  };
}
