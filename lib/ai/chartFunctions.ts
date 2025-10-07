/**
 * OpenAI Function Definitions for Chart Generation
 * Using function calling for reliable, type-safe chart creation
 */

export const CHART_FUNCTIONS = [
  {
    type: "function" as const,
    function: {
      name: "create_line_chart",
      description:
        "Create a line chart to show trends over time. Best for: time series data, tracking metrics over dates/weeks/months, showing growth or decline patterns.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Clear, descriptive chart title (e.g., 'CUME Trend Over Time')",
          },
          description: {
            type: "string",
            description: "Optional 1-sentence explanation of what the chart shows",
          },
          xAxis: {
            type: "string",
            description: "X-axis field name",
            enum: ["date", "week", "month", "station"],
          },
          metrics: {
            type: "array",
            description: "Metrics to plot (up to 3 for readability)",
            items: {
              type: "string",
              enum: ["cume", "tlh", "tsl", "activeSessions"],
            },
            minItems: 1,
            maxItems: 3,
          },
        },
        required: ["title", "xAxis", "metrics"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_bar_chart",
      description:
        "Create a bar chart for comparing values across categories. Best for: station comparisons, daypart analysis, device breakdowns.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Clear chart title (e.g., 'CUME by Station')",
          },
          description: {
            type: "string",
            description: "Optional explanation",
          },
          xAxis: {
            type: "string",
            description: "Category to group by",
            enum: ["station", "daypart", "device", "week", "date"],
          },
          metrics: {
            type: "array",
            description: "Metrics to compare (1-2 recommended)",
            items: {
              type: "string",
              enum: ["cume", "tlh", "tsl", "activeSessions"],
            },
            minItems: 1,
            maxItems: 2,
          },
        },
        required: ["title", "xAxis", "metrics"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_pie_chart",
      description:
        "Create a donut/pie chart showing distribution or composition. Best for: device distribution, station share, categorical breakdowns. Limit to 8 segments max.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Chart title (e.g., 'Device Distribution')",
          },
          description: {
            type: "string",
            description: "Optional explanation",
          },
          groupBy: {
            type: "string",
            description: "Field to segment by",
            enum: ["device", "station", "daypart"],
          },
          metric: {
            type: "string",
            description: "Metric to sum for each segment",
            enum: ["cume", "tlh", "activeSessions"],
          },
        },
        required: ["title", "groupBy", "metric"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_heatmap",
      description:
        "Create a heatmap for two-dimensional patterns. Best for: hourly patterns by device, station performance by daypart, time-based correlations.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Chart title (e.g., 'Hourly Listening by Device')",
          },
          description: {
            type: "string",
            description: "Optional explanation",
          },
          xAxis: {
            type: "string",
            description: "Horizontal axis dimension",
            enum: ["hour", "daypart", "device", "station"],
          },
          yAxis: {
            type: "string",
            description: "Vertical axis dimension (must differ from xAxis)",
            enum: ["hour", "daypart", "device", "station"],
          },
          metric: {
            type: "string",
            description: "Value to show in heatmap cells",
            enum: ["cume", "tlh", "tsl"],
          },
        },
        required: ["title", "xAxis", "yAxis", "metric"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_table",
      description:
        "Create a data table for detailed views. Best for: showing raw data, detailed breakdowns, exportable views.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Table title",
          },
          description: {
            type: "string",
            description: "Optional explanation",
          },
          columns: {
            type: "array",
            description: "Columns to display (3-6 recommended)",
            items: {
              type: "string",
              enum: [
                "date",
                "station",
                "device",
                "daypart",
                "cume",
                "tlh",
                "tsl",
                "activeSessions",
              ],
            },
            minItems: 3,
            maxItems: 8,
          },
        },
        required: ["title", "columns"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_kpi_card",
      description:
        "Create a KPI summary card. Best for: highlighting key metrics, showing aggregated values at dashboard top.",
      parameters: {
        type: "object",
        properties: {
          label: {
            type: "string",
            description: "KPI label (e.g., 'Avg CUME', 'Total Listening Hours')",
          },
          metric: {
            type: "string",
            description: "Metric to calculate",
            enum: ["cume", "tlh", "tsl", "activeSessions"],
          },
          calculation: {
            type: "string",
            description: "How to aggregate the metric",
            enum: ["average", "sum", "max", "min", "count"],
          },
          format: {
            type: "string",
            description: "Display format",
            enum: ["number", "decimal", "percentage"],
            default: "number",
          },
          color: {
            type: "string",
            description: "Card color theme",
            enum: ["orange", "blue", "cream"],
            default: "orange",
          },
        },
        required: ["label", "metric", "calculation"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_filter",
      description:
        "Create a data filter control. Best for: allowing users to filter by station, date range, device, etc.",
      parameters: {
        type: "object",
        properties: {
          label: {
            type: "string",
            description: "Filter label (e.g., 'Station', 'Date Range')",
          },
          field: {
            type: "string",
            description: "Field to filter on",
            enum: ["station", "device", "daypart", "date"],
          },
          type: {
            type: "string",
            description: "Filter UI type",
            enum: ["select", "multiselect", "date"],
          },
        },
        required: ["label", "field", "type"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "add_insight",
      description:
        "Add a text insight or recommendation based on data patterns. Best for: highlighting key findings, providing context.",
      parameters: {
        type: "object",
        properties: {
          insight: {
            type: "string",
            description:
              "Concise insight about the data (1-2 sentences, specific numbers/trends)",
          },
        },
        required: ["insight"],
      },
    },
  },
];

// Type definitions for function responses
export interface LineChartArgs {
  title: string;
  description?: string;
  xAxis: "date" | "week" | "month" | "station";
  metrics: ("cume" | "tlh" | "tsl" | "activeSessions")[];
}

export interface BarChartArgs {
  title: string;
  description?: string;
  xAxis: "station" | "daypart" | "device" | "week" | "date";
  metrics: ("cume" | "tlh" | "tsl" | "activeSessions")[];
}

export interface PieChartArgs {
  title: string;
  description?: string;
  groupBy: "device" | "station" | "daypart";
  metric: "cume" | "tlh" | "activeSessions";
}

export interface HeatmapArgs {
  title: string;
  description?: string;
  xAxis: "hour" | "daypart" | "device" | "station";
  yAxis: "hour" | "daypart" | "device" | "station";
  metric: "cume" | "tlh" | "tsl";
}

export interface TableArgs {
  title: string;
  description?: string;
  columns: string[];
}

export interface KPIArgs {
  label: string;
  metric: "cume" | "tlh" | "tsl" | "activeSessions";
  calculation: "average" | "sum" | "max" | "min" | "count";
  format?: "number" | "decimal" | "percentage";
  color?: "orange" | "blue" | "cream";
}

export interface FilterArgs {
  label: string;
  field: "station" | "device" | "daypart" | "date";
  type: "select" | "multiselect" | "date";
}

export interface InsightArgs {
  insight: string;
}
