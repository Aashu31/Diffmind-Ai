import OpenAI from "openai";
import { env } from "../../config";
import { ToolCall, ToolResult } from "../../types";
import { ChatCompletion, ChatCompletionChunk } from "openai/resources/chat/completions";

export interface NemotronMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  reasoning_content?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface NemotronResponse {
  content: string | null;
  reasoning_content?: string;
  tool_calls?: ToolCall[];
  finish_reason: string;
}

export interface NemotronStreamChunk {
  content?: string;
  reasoning_content?: string;
  tool_calls?: ToolCall[];
  finish_reason?: string;
}

export class NemotronProvider {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: env.NVIDIA_API_KEY,
      baseURL: env.NVIDIA_BASE_URL,
      timeout: env.NVIDIA_TIMEOUT_MS,
      maxRetries: 2,
    });
    this.model = env.NVIDIA_MODEL;
  }

  private getChatParams(
    messages: NemotronMessage[],
    tools?: OpenAI.Chat.Completions.ChatCompletionTool[],
    toolChoice?: "auto" | "none" | { type: "function"; function: { name: string } },
    stream?: boolean
  ): OpenAI.Chat.Completions.ChatCompletionCreateParams {
    return {
      model: this.model,
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      tools,
      tool_choice: toolChoice,
      temperature: env.NVIDIA_TEMPERATURE,
      top_p: env.NVIDIA_TOP_P,
      max_tokens: env.NVIDIA_MAX_TOKENS,
      stream: stream ?? false,
    };
  }

  async chat(
    messages: NemotronMessage[],
    tools?: OpenAI.Chat.Completions.ChatCompletionTool[],
    toolChoice?: "auto" | "none" | { type: "function"; function: { name: string } }
  ): Promise<NemotronResponse> {
    const completion = await this.client.chat.completions.create(this.getChatParams(messages, tools, toolChoice)) as ChatCompletion;

    const choice = completion.choices[0];
    const message = choice.message;

    return {
      content: message.content,
      reasoning_content: (message as OpenAI.Chat.Completions.ChatCompletionMessage & { reasoning_content?: string }).reasoning_content,
      tool_calls: message.tool_calls?.map((tc) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments),
      })),
      finish_reason: choice.finish_reason ?? "stop",
    };
  }

  async *streamChat(
    messages: NemotronMessage[],
    tools?: OpenAI.Chat.Completions.ChatCompletionTool[],
    toolChoice?: "auto" | "none" | { type: "function"; function: { name: string } }
  ): AsyncGenerator<NemotronStreamChunk> {
    const stream = await this.client.chat.completions.create(this.getChatParams(messages, tools, toolChoice, true)) as AsyncIterable<ChatCompletionChunk>;

    let accumulatedToolCalls: ToolCall[] = [];

    for await (const chunk of stream) {
      const choice = chunk.choices[0];
      if (!choice.delta) continue;

      const delta = choice.delta;
      const reasoningDelta = (delta as OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta & { reasoning_content?: string }).reasoning_content;

      if (reasoningDelta) {
        yield { reasoning_content: reasoningDelta };
      }

      if (delta.content) {
        yield { content: delta.content };
      }

      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const index = tc.index ?? 0;
          if (!accumulatedToolCalls[index]) {
            accumulatedToolCalls[index] = { id: tc.id ?? "", name: tc.function?.name ?? "", arguments: {} };
          }
          if (tc.function?.arguments) {
            accumulatedToolCalls[index].arguments = {
              ...accumulatedToolCalls[index].arguments,
              ...JSON.parse(tc.function.arguments),
            };
          }
        }
      }

      if (choice.finish_reason) {
        yield {
          finish_reason: choice.finish_reason,
          tool_calls: accumulatedToolCalls.filter(Boolean),
        };
      }
    }
  }

  separateReasoningAndContent(response: NemotronResponse): { reasoning: string | undefined; content: string | undefined } {
    return {
      reasoning: response.reasoning_content,
      content: response.content ?? undefined,
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 5,
        temperature: 0,
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const nemotronProvider = new NemotronProvider();