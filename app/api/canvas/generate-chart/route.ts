import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

export const runtime = "edge";

const client = new OpenAI({
  apiKey: process.env.THESYS_API_KEY!,
  baseURL: "https://api.thesys.dev/v1/embed",
});

const SYSTEM_PROMPT = `You are a Radio Analytics AI Assistant specialized in creating individual chart visualizations for a canvas workspace.

Your task is to:
1. Understand what the user wants to visualize
2. Query the available data tables to get the actual data
3. Create ONE chart card that best visualizes what they asked for

Available chart types:
- line: For trends over time
- bar: For comparing categories
- pie: For showing distributions (use sparingly)
- table: For detailed data views

CRITICAL: You MUST call create_chart_card exactly ONCE per request to specify what chart to create.`;

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "list_available_tables",
      description: "List all available data tables that have been uploaded by the user.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_radio_data",
      description: "Query radio station data from uploaded CSV files to get actual data for the chart.",
      parameters: {
        type: "object",
        properties: {
          tableName: {
            type: "string",
            description: "The name of the table to query",
          },
          limit: {
            type: "number",
            description: "Maximum number of rows to return (default: 100, max: 1000)",
          },
        },
        required: ["tableName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_chart_card",
      description: "Create a chart card on the canvas with the specified configuration. Call this ONCE after querying the data.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Short, descriptive title for the chart",
          },
          chartType: {
            type: "string",
            enum: ["line", "bar", "pie", "table"],
            description: "Type of chart to create",
          },
          data: {
            type: "array",
            description: "The actual data to visualize (from query_radio_data)",
            items: { type: "object" },
          },
          xAxis: {
            type: "string",
            description: "The field to use for x-axis (or table column)",
          },
          yAxis: {
            type: "string",
            description: "The field to use for y-axis (or metric to visualize)",
          },
          description: {
            type: "string",
            description: "Brief description of what this chart shows",
          },
        },
        required: ["title", "chartType", "data", "xAxis", "yAxis"],
      },
    },
  },
];

async function executeToolCall(toolName: string, toolArgs: any) {
  try {
    if (toolName === "list_available_tables") {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/tools/list-tables`
      );
      const data = await response.json();
      return JSON.stringify(data);
    }

    if (toolName === "query_radio_data") {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/tools/query-data`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tableName: toolArgs.tableName,
            query: {
              limit: toolArgs.limit || 100,
            },
          }),
        }
      );
      const data = await response.json();
      return JSON.stringify(data);
    }

    if (toolName === "create_chart_card") {
      // This tool doesn't execute anything - it just returns the spec
      return JSON.stringify({ success: true });
    }

    return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  } catch (error: any) {
    return JSON.stringify({ error: error.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // First API call with tools
    const response = await client.chat.completions.create({
      model: "c1/anthropic/claude-sonnet-4/v-20250815",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      tools,
      stream: false,
    });

    const message = response.choices[0].message;

    // Handle tool calls
    if (message.tool_calls && message.tool_calls.length > 0) {
      const updatedMessages: any[] = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
        message,
      ];

      let chartSpec = null;

      // Execute all tool calls
      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        // If this is the create_chart_card call, save the spec
        if (toolName === "create_chart_card") {
          chartSpec = toolArgs;
        }

        // Execute the tool
        const toolResult = await executeToolCall(toolName, toolArgs);

        // Add tool result to messages
        updatedMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: toolResult,
        });
      }

      // If we got a chart spec, return it
      if (chartSpec) {
        return NextResponse.json({
          success: true,
          chart: chartSpec,
        });
      }

      // If no chart spec yet, make another API call to get it
      const finalResponse = await client.chat.completions.create({
        model: "c1/anthropic/claude-sonnet-4/v-20250815",
        messages: updatedMessages,
        tools,
        stream: false,
      });

      const finalMessage = finalResponse.choices[0].message;

      // Check for create_chart_card in the second response
      if (finalMessage.tool_calls && finalMessage.tool_calls.length > 0) {
        for (const toolCall of finalMessage.tool_calls) {
          if (toolCall.function.name === "create_chart_card") {
            const chartArgs = JSON.parse(toolCall.function.arguments);
            return NextResponse.json({
              success: true,
              chart: chartArgs,
            });
          }
        }
      }
    }

    return NextResponse.json(
      { error: "AI did not generate a chart specification" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Chart generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate chart" },
      { status: 500 }
    );
  }
}
