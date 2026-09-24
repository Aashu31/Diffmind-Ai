import OpenAI from "openai";
import { NemotronProvider, NemotronMessage, NemotronResponse } from "../providers/NemotronProvider";
import { REVIEW_SYSTEM_PROMPT, REVIEW_TOOLS } from "../prompts/review-system-prompt";
import { ToolCall, ToolResult, ReviewContext, Finding, AgentStep, AgentState } from "../../types";
import { env } from "../../config";

export interface ToolExecutor {
  (name: string, args: Record<string, unknown>): Promise<ToolResult>;
}

export class AgentLoop {
  private provider: NemotronProvider;
  private toolExecutor: ToolExecutor;
  private maxSteps: number;

  constructor(provider: NemotronProvider, toolExecutor: ToolExecutor, maxSteps: number = env.DIFFMIND_MAX_AGENT_STEPS) {
    this.provider = provider;
    this.toolExecutor = toolExecutor;
    this.maxSteps = maxSteps;
  }

  async run(context: ReviewContext, initialPrompt: string): Promise<{ findings: Finding[]; summary: string; overallAssessment: "PASS" | "NEEDS_ATTENTION"; steps: AgentStep[] }> {
    const messages: NemotronMessage[] = [
      { role: "system", content: REVIEW_SYSTEM_PROMPT },
      { role: "user", content: initialPrompt },
    ];

    const steps: AgentStep[] = [];

    for (let step = 1; step <= this.maxSteps; step++) {
      const response = await this.provider.chat(messages, [...REVIEW_TOOLS] as OpenAI.Chat.Completions.ChatCompletionTool[], "auto");

      const stepData: AgentStep = {
        step,
        reasoning: response.reasoning_content,
      };

      if (response.tool_calls && response.tool_calls.length > 0) {
        stepData.toolCalls = response.tool_calls;
        stepData.toolResults = [];

        for (const toolCall of response.tool_calls) {
          const result = await this.toolExecutor(toolCall.name, toolCall.arguments);
          stepData.toolResults.push(result);

          messages.push({
            role: "assistant",
            content: null,
            tool_calls: [toolCall],
            reasoning_content: response.reasoning_content,
          });

          messages.push({
            role: "tool",
            content: JSON.stringify(result.result),
            tool_call_id: toolCall.id,
            name: toolCall.name,
          });
        }

        steps.push(stepData);
        continue;
      }

      if (response.content) {
        try {
          const parsed = JSON.parse(response.content);
          if (parsed.findings && Array.isArray(parsed.findings)) {
            steps.push(stepData);
            return {
              findings: parsed.findings,
              summary: parsed.summary ?? "Review completed",
              overallAssessment: parsed.overall_assessment ?? "NEEDS_ATTENTION",
              steps,
            };
          }
        } catch {
          // Not valid JSON, continue
        }
      }

      if (response.finish_reason === "stop" || response.finish_reason === "length") {
        steps.push(stepData);
        break;
      }

      steps.push(stepData);
    }

    return {
      findings: [],
      summary: "Agent completed without producing structured findings",
      overallAssessment: "NEEDS_ATTENTION",
      steps,
    };
  }
}