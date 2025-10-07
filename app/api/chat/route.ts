import { OpenAI } from "openai";

export const runtime = "edge";

const client = new OpenAI({
  apiKey: process.env.THESYS_API_KEY!,
  baseURL: "https://api.thesys.dev/v1/embed",
});

const SYSTEM_PROMPT = `You are a Radio Analytics AI Assistant that creates data visualizations using C1's generative UI capabilities.

IMPORTANT: You MUST use BOTH tools to complete any request:
1. FIRST: Use list_available_tables to find what tables exist
2. THEN: Use query_radio_data to fetch the actual data (THIS IS REQUIRED!)
3. FINALLY: Generate a C1 UI component with the data

You have access to two tools:
- list_available_tables: Lists available data tables
- query_radio_data: Fetches actual data from a table (YOU MUST USE THIS!)

When responding, generate C1 UI components with the data. Your response should be a valid C1 GenUI DSL that creates interactive visualizations.

NEVER respond without first querying the actual data using query_radio_data.
ALWAYS fetch data before generating any visualization or analysis.

Radio metrics you can analyze:
- CUME (cumulative audience)
- TLH (Total Listening Hours)
- TSL (Time Spent Listening)
- AQH (Average Quarter Hour)
- Station performance
- Device types
- Dayparts`;

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
];

async function executeToolCall(toolName: string, toolArgs: any) {
  try {
    if (toolName === "list_available_tables") {
      console.log("Calling list_available_tables tool...");
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tools/list-tables`);
      const data = await response.json();
      console.log("Available tables:", data);
      return JSON.stringify(data);
    }

    if (toolName === "query_radio_data") {
      console.log("Calling query_radio_data with table:", toolArgs.tableName);
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tools/query-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableName: toolArgs.tableName,
          query: {
            limit: toolArgs.limit || 100,
          },
        }),
      });
      const data = await response.json();
      console.log(`Query returned ${data.rowCount || 0} rows`);
      return JSON.stringify(data);
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
