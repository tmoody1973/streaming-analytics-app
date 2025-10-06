import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";
import { NextRequest } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const serviceAdapter = new OpenAIAdapter({ openai });

const runtime = new CopilotRuntime({
  actions: [
    {
      name: "analyzeRadioMetrics",
      description:
        "Analyze radio streaming metrics with proper CUME averaging. CUME values should ALWAYS be averaged, never summed. Calculate TSL as TLH ÷ CUME.",
      parameters: [
        {
          name: "metrics",
          type: "object[]",
          description: "Array of radio metrics to analyze",
          required: true,
        },
        {
          name: "timeframe",
          type: "string",
          description: "Time period for analysis (e.g., 'weekly', 'monthly', 'quarterly')",
          required: true,
        },
      ],
      handler: async ({ metrics, timeframe }: { metrics: any[]; timeframe: string }) => {
        // This is a placeholder - actual implementation will process the metrics
        const metricsCount = Array.isArray(metrics) ? metrics.length : 0;
        return {
          analysis: `Analyzed ${metricsCount} data points over ${timeframe} period. Remember: CUME is averaged, not summed.`,
          recommendations: [
            "Review daypart performance for optimization opportunities",
            "Compare streaming CUME trends with Nielsen data",
            "Analyze device distribution for audience insights",
          ],
        };
      },
    },
    {
      name: "calculateCUME",
      description:
        "Calculate proper CUME average. CRITICAL: CUME must ALWAYS be averaged, never summed. This is a fundamental radio industry rule.",
      parameters: [
        {
          name: "cumeValues",
          type: "number[]",
          description: "Array of CUME values to average",
          required: true,
        },
      ],
      handler: async ({ cumeValues }: { cumeValues: number[] }) => {
        const validValues = cumeValues.filter((v: number) => !isNaN(v) && v > 0);
        if (validValues.length === 0) {
          return { error: "No valid CUME values provided" };
        }

        const average = validValues.reduce((sum: number, val: number) => sum + val, 0) / validValues.length;

        return {
          averageCUME: Math.round(average),
          dataPoints: validValues.length,
          note: "CUME has been properly averaged (not summed) per radio industry standards",
        };
      },
    },
    {
      name: "correlateNielsenData",
      description:
        "Correlate streaming metrics with Nielsen ratings data to identify trends and patterns",
      parameters: [
        {
          name: "streamingData",
          type: "object[]",
          description: "Streaming metrics from Triton",
          required: true,
        },
        {
          name: "nielsenData",
          type: "object[]",
          description: "Nielsen ratings data",
          required: true,
        },
      ],
      handler: async ({ streamingData, nielsenData }: { streamingData: any[]; nielsenData: any[] }) => {
        const streamingCount = Array.isArray(streamingData) ? streamingData.length : 0;
        const nielsenCount = Array.isArray(nielsenData) ? nielsenData.length : 0;
        return {
          correlation: "Analysis placeholder - will calculate Pearson correlation coefficient",
          streamingDataPoints: streamingCount,
          nielsenDataPoints: nielsenCount,
          insights: [
            "Strong correlation between streaming CUME and Nielsen CUME indicates aligned audience measurement",
            "Streaming daypart performance may predict Nielsen trends",
          ],
        };
      },
    },
  ],
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
