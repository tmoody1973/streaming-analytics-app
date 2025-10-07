import { OpenAI } from "openai";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "edge";

const client = new OpenAI({
  apiKey: process.env.THESYS_API_KEY!,
  baseURL: "https://api.thesys.dev/v1/embed",
});

const SYSTEM_PROMPT = `You are a Radio Analytics AI Assistant that creates data visualizations using C1's generative UI capabilities.

🚨 CRITICAL RULE: You MUST generate a C1 GenUI component after fetching data. Empty responses are FORBIDDEN.

WORKFLOW:

1. **Discover Tables** - Use list_available_tables() to find available datasets

2. **Fetch Data** - Use query_radio_data(tableName, limit) to get real data
   - Fetch 50-100 rows for meaningful visualizations
   - For comparisons: fetch data with ALL stations/values you need

3. **Generate Visualization** - ALWAYS create C1 UI with the data you fetched
   - Even if the data seems incomplete, CREATE A CHART
   - Show what data you have - never return nothing
   - Use LineChart, BarChart, Table, or Card components

TOOLS:
- list_available_tables(): Find available datasets
- get_table_schema(tableName): See column structure (optional)
- query_radio_data(tableName, limit): Fetch raw data (use for simple queries)
- execute_smart_query(queryType, stations, metric): ADVANCED - Use for comparisons, rankings, "best" queries
  * queryType options: "compare_stations", "best_hours", "station_overview", "hourly_trends"
  * Automatically aggregates, filters, and sorts data
  * Examples:
    - Compare WYMS vs WYMSHD2: execute_smart_query("compare_stations", ["WYMSFM", "WYMSHD2"], "cume")
    - Find best hours: execute_smart_query("best_hours", ["WYMSFM"], "cume", 5)

HANDLING COMPARISONS:
When user asks to compare stations (e.g., "Compare WYMS vs WYMSHD2"):
1. Fetch data with BOTH stations in the same query
2. The query returns ALL stations - you'll see both WYMS and WYMSHD2 in the data
3. Create a chart that shows BOTH stations side-by-side
4. Use different colors or lines for each station

Example: "Compare WYMS vs WYMSHD2 by hour"
→ query_radio_data("radio_milwaukee_hourly_patterns", 100)
→ Returns rows for WYMS, WYMSHD2, and other stations
→ Create LineChart with Hour on X-axis, metric on Y-axis, grouped by Station

STRICT RULES:
- If you fetch data → you MUST create a visualization
- Never return empty/null content after tool calls
- Show the data even if it's not perfect
- Common columns: Station, Hour, Date, CUME, TLH, TSL, AAS, Device

If you're unsure what to visualize: Create a Table showing the raw data!`;

// Query templates for common patterns
const QUERY_TEMPLATES = {
  compare_stations_by_hour: (stations: string[], metric: string = 'cume') => {
    const stationList = stations.map(s => `'${s.toUpperCase()}'`).join(',');
    return `
      SELECT
        station,
        hour_of_day as hour,
        ROUND(AVG(${metric})::numeric, 2) as avg_${metric},
        COUNT(*) as data_points
      FROM radio_milwaukee_hourly_patterns
      WHERE UPPER(station) IN (${stationList})
      GROUP BY station, hour_of_day
      ORDER BY hour_of_day, station
    `;
  },

  best_hours_for_station: (station: string, metric: string = 'cume', limit: number = 5) => {
    return `
      SELECT
        hour_of_day as hour,
        ROUND(AVG(${metric})::numeric, 2) as avg_${metric},
        COUNT(*) as weeks_analyzed
      FROM radio_milwaukee_hourly_patterns
      WHERE UPPER(station) = '${station.toUpperCase()}'
      GROUP BY hour_of_day
      ORDER BY avg_${metric} DESC
      LIMIT ${limit}
    `;
  },

  station_overview: (station: string) => {
    return `
      SELECT
        station,
        ROUND(AVG(cume)::numeric, 2) as avg_cume,
        ROUND(AVG(tlh)::numeric, 2) as avg_tlh,
        ROUND(AVG(aas)::numeric, 2) as avg_aas,
        COUNT(DISTINCT week) as weeks_of_data
      FROM radio_milwaukee_hourly_patterns
      WHERE UPPER(station) = '${station.toUpperCase()}'
      GROUP BY station
    `;
  },

  hourly_trends: (station: string, metric: string = 'cume') => {
    return `
      SELECT
        hour_of_day as hour,
        week,
        ${metric}
      FROM radio_milwaukee_hourly_patterns
      WHERE UPPER(station) = '${station.toUpperCase()}'
      ORDER BY week, hour_of_day
      LIMIT 500
    `;
  },
};

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "list_available_tables",
      description: "List all available data tables that have been uploaded by the user. Use this to see what data is available.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_table_schema",
      description: "Get detailed information about a table's structure including column names, data types, and sample data. Use this to understand what data is available before querying.",
      parameters: {
        type: "object",
        properties: {
          tableName: {
            type: "string",
            description: "The name of the table to inspect",
          },
        },
        required: ["tableName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_radio_data",
      description: "Query radio station data from the uploaded CSV files. Use this to fetch actual user data for analysis and visualization.",
      parameters: {
        type: "object",
        properties: {
          tableName: {
            type: "string",
            description: "The name of the table to query (use list_available_tables first if unknown)",
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
      name: "execute_smart_query",
      description: "Execute optimized SQL queries for complex analysis like comparisons, rankings, and aggregations. Use this for queries that need filtering, grouping, or finding 'best' values.",
      parameters: {
        type: "object",
        properties: {
          queryType: {
            type: "string",
            enum: ["compare_stations", "best_hours", "station_overview", "hourly_trends"],
            description: "Type of query: compare_stations (compare 2+ stations), best_hours (find top performing hours), station_overview (station summary), hourly_trends (time series data)"
          },
          stations: {
            type: "array",
            items: { type: "string" },
            description: "Station names (e.g. ['WYMSFM', 'WYMSHD2']). Required for compare_stations and best_hours"
          },
          metric: {
            type: "string",
            enum: ["cume", "tlh", "tsl", "aas"],
            description: "Metric to analyze (default: cume). cume=audience, tlh=listening hours, tsl=time spent, aas=active sessions"
          },
          limit: {
            type: "number",
            description: "Max results for best_hours query (default: 5)"
          }
        },
        required: ["queryType", "stations"],
      },
    },
  },
];

async function executeToolCall(toolName: string, toolArgs: any) {
  try {
    if (toolName === "list_available_tables") {
      console.log("Calling list_available_tables tool...");

      // DYNAMIC TABLE DISCOVERY: Query Supabase for all tables starting with 'radio_milwaukee_'
      // This automatically finds any uploaded CSV without code changes
      try {
        const { data: tables, error } = await supabaseAdmin.rpc('get_public_tables');

        if (error) {
          console.log("RPC not available, using fallback discovery");

          // Fallback: Try common table patterns
          const commonPatterns = [
            'radio_milwaukee_daily_overview',
            'radio_milwaukee_device_analysis',
            'radio_milwaukee_daypart',
            'radio_milwaukee_hourly',
            'radio_milwaukee_hourly_patterns',
          ];

          const existingTables = [];
          for (const tableName of commonPatterns) {
            try {
              const { error: checkError } = await supabaseAdmin
                .from(tableName)
                .select('id')
                .limit(1);

              if (!checkError) {
                existingTables.push(tableName);
              }
            } catch (e) {
              // Table doesn't exist, skip
            }
          }

          return JSON.stringify({
            success: true,
            tables: existingTables,
          });
        }

        // Filter for radio_milwaukee_ tables from RPC result
        const radioTables = tables
          .filter((table: any) => table.tablename?.startsWith('radio_milwaukee_'))
          .map((table: any) => table.tablename);

        console.log("Dynamically discovered tables:", radioTables);

        return JSON.stringify({
          success: true,
          tables: radioTables,
        });
      } catch (err: any) {
        console.error("Table discovery error:", err);
        return JSON.stringify({
          success: false,
          tables: [],
          error: err.message
        });
      }
    }

    if (toolName === "get_table_schema") {
      console.log("Calling get_table_schema for table:", toolArgs.tableName);

      const tableName = toolArgs.tableName;

      if (!tableName) {
        return JSON.stringify({ error: "Table name is required" });
      }

      try {
        // Get 5 sample rows to analyze schema
        const { data: sampleRows, error: sampleError } = await supabaseAdmin
          .from(tableName)
          .select("*")
          .limit(5);

        if (sampleError) {
          console.error("Schema fetch error:", sampleError);
          return JSON.stringify({
            success: false,
            error: `Failed to fetch schema: ${sampleError.message}`
          });
        }

        if (!sampleRows || sampleRows.length === 0) {
          return JSON.stringify({
            success: true,
            tableName,
            columns: [],
            sampleData: [],
            message: "Table exists but is empty"
          });
        }

        // Extract column names and infer types from first row
        const firstRow = sampleRows[0];
        const columns = Object.keys(firstRow).map(colName => {
          const value = firstRow[colName];
          let type = "unknown";

          if (value === null || value === undefined) {
            type = "nullable";
          } else if (typeof value === "number") {
            type = "number";
          } else if (typeof value === "string") {
            // Try to detect date strings
            if (!isNaN(Date.parse(value))) {
              type = "date/string";
            } else {
              type = "string";
            }
          } else if (typeof value === "boolean") {
            type = "boolean";
          }

          return {
            name: colName,
            type,
            sample: value
          };
        });

        console.log(`Schema for ${tableName}:`, columns.map(c => c.name).join(", "));

        return JSON.stringify({
          success: true,
          tableName,
          columns,
          sampleData: sampleRows,
          rowCount: sampleRows.length
        });
      } catch (err: any) {
        console.error("get_table_schema error:", err);
        return JSON.stringify({
          success: false,
          error: err.message
        });
      }
    }

    if (toolName === "query_radio_data") {
      console.log("Calling query_radio_data with table:", toolArgs.tableName);

      const tableName = toolArgs.tableName;
      const limit = toolArgs.limit || 100;

      if (!tableName) {
        return JSON.stringify({ error: "Table name is required" });
      }

      // Query Supabase directly
      let query = supabaseAdmin.from(tableName).select("*");

      if (limit) {
        query = query.limit(limit);
      }

      const { data: rows, error } = await query;

      if (error) {
        console.error("Query error:", error);
        return JSON.stringify({ error: `Query failed: ${error.message}` });
      }

      const result = {
        success: true,
        data: rows,
        rowCount: rows?.length || 0,
      };

      console.log(`Query returned ${result.rowCount} rows from ${tableName}`);
      return JSON.stringify(result);
    }

    if (toolName === "execute_smart_query") {
      console.log("Calling execute_smart_query:", toolArgs);

      const { queryType, stations, metric = 'cume', limit = 5 } = toolArgs;

      if (!queryType || !stations || stations.length === 0) {
        return JSON.stringify({
          error: "queryType and stations are required"
        });
      }

      let sql = '';

      try {
        // Generate SQL from template
        switch (queryType) {
          case 'compare_stations':
            sql = QUERY_TEMPLATES.compare_stations_by_hour(stations, metric);
            break;
          case 'best_hours':
            sql = QUERY_TEMPLATES.best_hours_for_station(stations[0], metric, limit);
            break;
          case 'station_overview':
            sql = QUERY_TEMPLATES.station_overview(stations[0]);
            break;
          case 'hourly_trends':
            sql = QUERY_TEMPLATES.hourly_trends(stations[0], metric);
            break;
          default:
            return JSON.stringify({ error: `Unknown queryType: ${queryType}` });
        }

        console.log(`Executing ${queryType} query:`, sql.trim().substring(0, 200));

        // Execute SQL via Supabase RPC
        const { data, error } = await supabaseAdmin.rpc('execute_sql_query', {
          query_text: sql
        });

        if (error) {
          console.error("Smart query error:", error);
          return JSON.stringify({
            success: false,
            error: `Query failed: ${error.message}`
          });
        }

        const result = {
          success: true,
          queryType,
          data,
          rowCount: data?.length || 0,
          sql: sql.trim() // Include SQL for debugging
        };

        console.log(`Smart query returned ${result.rowCount} rows`);
        return JSON.stringify(result);

      } catch (err: any) {
        console.error("execute_smart_query error:", err);
        return JSON.stringify({
          success: false,
          error: err.message
        });
      }
    }

    return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  } catch (error: any) {
    console.error("Tool execution error:", error);
    return JSON.stringify({ error: error.message });
  }
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  console.log("Chat API called with messages:", messages);

  // Add system prompt if this is the first message
  const messagesWithSystem = messages[0]?.role === "system"
    ? messages
    : [{ role: "system", content: SYSTEM_PROMPT }, ...messages];

  // First API call with tools
  console.log("Calling C1 API with tools...");
  const response = await client.chat.completions.create({
    model: "c1/anthropic/claude-sonnet-4/v-20250815",
    messages: messagesWithSystem,
    tools,
    stream: false, // Don't stream initially so we can handle tool calls
  });

  const message = response.choices[0].message;
  console.log("C1 initial response:", JSON.stringify(message, null, 2));

  // Check if the AI wants to use tools
  if (message.tool_calls && message.tool_calls.length > 0) {
    console.log("C1 wants to use tools:", message.tool_calls.map(tc => tc.function.name));

    // Add the assistant's message with tool calls
    const updatedMessages = [
      ...messagesWithSystem,
      message,
    ];

    // Execute all tool calls
    for (const toolCall of message.tool_calls) {
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);

      console.log(`Executing tool: ${toolName} with args:`, toolArgs);

      // Execute the tool
      const toolResult = await executeToolCall(toolName, toolArgs);

      console.log(`Tool ${toolName} result:`, toolResult.substring(0, 200));

      // Add tool result to messages
      updatedMessages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: toolResult,
      });
    }

    // Make a second API call with tool results, this time streaming
    console.log("Making final streaming call to C1...");
    console.log("Messages being sent to C1:", JSON.stringify(updatedMessages.map(m => ({
      role: m.role,
      content: m.content ? m.content.substring(0, 100) : null,
      tool_calls: m.tool_calls ? m.tool_calls.length + " tool calls" : undefined,
      tool_call_id: m.tool_call_id
    })), null, 2));

    const finalResponse = await client.chat.completions.create({
      model: "c1/anthropic/claude-sonnet-4/v-20250815",
      messages: updatedMessages,
      tools,
      stream: true,
    });

    console.log("Creating stream response...");

    // Collect tool calls from the stream
    let streamedToolCalls: any[] = [];
    let streamedContent = '';

    for await (const chunk of finalResponse) {
      // Collect tool calls from stream
      if (chunk.choices[0]?.delta?.tool_calls) {
        const deltaToolCalls = chunk.choices[0].delta.tool_calls;
        for (const deltaCall of deltaToolCalls) {
          if (!streamedToolCalls[deltaCall.index]) {
            streamedToolCalls[deltaCall.index] = {
              id: deltaCall.id || '',
              type: deltaCall.type || 'function',
              function: { name: '', arguments: '' }
            };
          }
          if (deltaCall.function?.name) {
            streamedToolCalls[deltaCall.index].function.name += deltaCall.function.name;
          }
          if (deltaCall.function?.arguments) {
            streamedToolCalls[deltaCall.index].function.arguments += deltaCall.function.arguments;
          }
        }
      }

      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        streamedContent += content;
      }
    }

    console.log("Stream collected tool calls:", streamedToolCalls.length);
    console.log("Streamed content length:", streamedContent.length);

    // If C1 wants to make more tool calls, handle them
    if (streamedToolCalls.length > 0) {
      console.log("Handling tool calls from stream:", streamedToolCalls.map(tc => tc.function.name));

      // Add the assistant's message with tool calls
      updatedMessages.push({
        role: "assistant",
        content: null,
        tool_calls: streamedToolCalls,
      });

      // Execute all tool calls
      for (const toolCall of streamedToolCalls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        console.log(`Executing stream tool: ${toolName} with args:`, toolArgs);

        const toolResult = await executeToolCall(toolName, toolArgs);

        console.log(`Stream tool ${toolName} result:`, toolResult.substring(0, 200));

        updatedMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: toolResult,
        });
      }

      // Make ANOTHER streaming call with the new tool results
      console.log("Making third C1 call with second set of tool results...");
      const thirdResponse = await client.chat.completions.create({
        model: "c1/anthropic/claude-sonnet-4/v-20250815",
        messages: updatedMessages,
        tools,
        stream: true,
      });

      // Now stream THIS response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            let finalContent = '';
            for await (const chunk of thirdResponse) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                finalContent += content;
                controller.enqueue(encoder.encode(content));
              }
            }
            console.log("Final response length:", finalContent.length);
            console.log("Final response preview:", finalContent.substring(0, 200));
            controller.close();
          } catch (error) {
            console.error("Final stream error:", error);
            controller.error(error);
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // If no tool calls, stream the content we collected
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        if (streamedContent) {
          controller.enqueue(encoder.encode(streamedContent));
        }
        console.log("Streamed content (no additional tools):", streamedContent.length);
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  }

  // If no tool calls, stream the response directly
  console.log("No tool calls, streaming response directly");
  const streamResponse = await client.chat.completions.create({
    model: "c1/anthropic/claude-sonnet-4/v-20250815",
    messages: messagesWithSystem,
    tools,
    stream: true,
  });

  console.log("Converting direct stream to Response...");

  // Create a readable stream that processes the OpenAI stream chunks
  const encoder = new TextEncoder();
  let directStreamContent = '';
  let hasDirectToolCalls = false;
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamResponse) {
          // Check if this chunk contains tool calls
          if (chunk.choices[0]?.delta?.tool_calls) {
            hasDirectToolCalls = true;
            console.log("Direct stream has tool calls:", chunk.choices[0].delta.tool_calls);
          }

          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            directStreamContent += content;
            controller.enqueue(encoder.encode(content));
          }
        }
        console.log("Direct stream total length:", directStreamContent.length);
        console.log("Direct stream first 200 chars:", directStreamContent.substring(0, 200));
        console.log("Direct stream had tool calls:", hasDirectToolCalls);
        controller.close();
      } catch (error) {
        console.error("Direct stream error:", error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
