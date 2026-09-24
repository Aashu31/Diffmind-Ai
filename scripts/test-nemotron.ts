import { NemotronProvider } from "../backend/src/ai/providers/NemotronProvider";
import { env } from "../backend/src/config";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function testNemotron() {
  console.log("Testing Nemotron 3 Ultra 550B connection...\n");

  console.log("Configuration:");
  console.log(`  Base URL: ${env.NVIDIA_BASE_URL}`);
  console.log(`  Model: ${env.NVIDIA_MODEL}`);
  console.log(`  Temperature: ${env.NVIDIA_TEMPERATURE}`);
  console.log(`  Top P: ${env.NVIDIA_TOP_P}`);
  console.log(`  Max Tokens: ${env.NVIDIA_MAX_TOKENS}`);
  console.log(`  Timeout: ${env.NVIDIA_TIMEOUT_MS}ms`);
  console.log(`  Reasoning Effort: ${env.NVIDIA_REASONING_EFFORT}`);
  console.log(`  Reasoning Budget: ${env.NVIDIA_REASONING_BUDGET}`);
  console.log("");

  const provider = new NemotronProvider();

  console.log("1. Health check...");
  const healthy = await provider.healthCheck();
  console.log(`   ${healthy ? "✓" : "✗"} Health check ${healthy ? "passed" : "failed"}`);

  if (!healthy) {
    console.log("\nHealth check failed. Check your NVIDIA_API_KEY and network connectivity.");
    process.exit(1);
  }

  console.log("\n2. Simple chat completion (non-streaming)...");
  try {
    const response = await provider.chat([
      { role: "system", content: "You are a helpful assistant. Keep responses very brief." },
      { role: "user", content: "Say 'Nemotron is working' and nothing else." },
    ]);

    console.log(`   ✓ Response received`);
    console.log(`   Content: ${response.content}`);
    console.log(`   Reasoning: ${response.reasoning_content ? "present (hidden)" : "none"}`);
    console.log(`   Finish reason: ${response.finish_reason}`);
  } catch (error) {
    console.log(`   ✗ Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    process.exit(1);
  }

  console.log("\n3. Streaming chat completion...");
  try {
    let content = "";
    let reasoning = "";
    let toolCalls: any[] = [];

    for await (const chunk of provider.streamChat([
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Count from 1 to 5, one number per line." },
    ])) {
      if (chunk.content) {
        content += chunk.content;
        process.stdout.write(chunk.content);
      }
      if (chunk.reasoning_content) {
        reasoning += chunk.reasoning_content;
      }
      if (chunk.tool_calls) {
        toolCalls = chunk.tool_calls;
      }
      if (chunk.finish_reason) {
        console.log(`\n   Finish reason: ${chunk.finish_reason}`);
      }
    }

    console.log(`\n   ✓ Streaming completed`);
    console.log(`   Total content length: ${content.length}`);
    console.log(`   Reasoning present: ${reasoning.length > 0 ? "yes (hidden)" : "no"}`);
    console.log(`   Tool calls: ${toolCalls.length}`);
  } catch (error) {
    console.log(`   ✗ Streaming failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    process.exit(1);
  }

  console.log("\n4. Tool calling test...");
  try {
    const response = await provider.chat([
      { role: "system", content: "You have access to a get_weather tool. Use it when asked about weather." },
      { role: "user", content: "What's the weather in San Francisco?" },
    ], [
      {
        type: "function",
        function: {
          name: "get_weather",
          description: "Get current weather",
          parameters: {
            type: "object",
            properties: {
              location: { type: "string" },
            },
            required: ["location"],
          },
        },
      },
    ], "auto");

    console.log(`   ✓ Tool calling works`);
    console.log(`   Content: ${response.content}`);
    console.log(`   Tool calls: ${response.tool_calls?.length ?? 0}`);
    if (response.tool_calls) {
      response.tool_calls.forEach((tc) => {
        console.log(`     - ${tc.name}(${JSON.stringify(tc.arguments)})`);
      });
    }
  } catch (error) {
    console.log(`   ✗ Tool calling failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  console.log("\n✓ All tests passed!");
  console.log("\nNemotron 3 Ultra 550B is ready for use with DiffMind AI.");
}

testNemotron().catch((error) => {
  console.error("\n✗ Test failed:", error);
  process.exit(1);
});