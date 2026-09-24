import { ReviewContext, Finding, ParsedDiff } from "../../types";
import { NemotronProvider } from "../providers/NemotronProvider";
import { AgentLoop } from "./AgentLoop";
import { formatDiffForPrompt, getFileLanguage } from "../../review/context/builder";
import { env } from "../../config";

export interface AgentDependencies {
  getPullRequest: () => Promise<ReviewContext["pullRequest"]>;
  getChangedFiles: () => Promise<Array<{ file: string; status: string; additions: number; deletions: number }>>;
  getFileContent: (file: string, ref: string) => Promise<string>;
  getDiff: (file: string) => Promise<string>;
  getRepositoryMetadata: () => Promise<ReviewContext["repository"]>;
}

export class DiffMindReviewAgent {
  private provider: NemotronProvider;
  private loop: AgentLoop;
  private deps: AgentDependencies;
  private context: ReviewContext;

  constructor(context: ReviewContext, deps: AgentDependencies) {
    this.context = context;
    this.deps = deps;
    this.provider = new NemotronProvider();
    this.loop = new AgentLoop(this.provider, this.executeTool.bind(this));
  }

  private async executeTool(name: string, args: Record<string, unknown>): Promise<{ callId: string; name: string; result: unknown; error?: string }> {
    try {
      let result: unknown;

      switch (name) {
        case "get_pull_request":
          result = await this.deps.getPullRequest();
          break;
        case "get_changed_files":
          result = await this.deps.getChangedFiles();
          break;
        case "get_file_content":
          result = await this.deps.getFileContent(args.file as string, args.ref as string);
          break;
        case "get_diff":
          result = await this.deps.getDiff(args.file as string);
          break;
        case "get_repository_metadata":
          result = await this.deps.getRepositoryMetadata();
          break;
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return { callId: `call_${Date.now()}_${Math.random().toString(36).slice(2)}`, name, result };
    } catch (error) {
      return {
        callId: `call_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name,
        result: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async review(): Promise<{ findings: Finding[]; summary: string; overallAssessment: "PASS" | "NEEDS_ATTENTION"; steps: number }> {
    const initialPrompt = this.buildInitialPrompt();
    const result = await this.loop.run(this.context, initialPrompt);

    return {
      findings: result.findings,
      summary: result.summary,
      overallAssessment: result.overallAssessment,
      steps: result.steps.length,
    };
  }

  private buildInitialPrompt(): string {
    const { repository, pullRequest, diff, changedFiles } = this.context;

    const diffText = formatDiffForPrompt(diff, 12000);

    return `## Pull Request to Review

**Repository:** ${repository.fullName} (${repository.private ? "private" : "public"})
**Default Branch:** ${repository.defaultBranch}

**PR #${pullRequest.number}:** ${pullRequest.title}
**Author:** @${pullRequest.authorLogin}
**Source:** ${pullRequest.sourceBranch} (${pullRequest.headSha.slice(0, 8)})
**Target:** ${pullRequest.targetBranch} (${pullRequest.baseSha.slice(0, 8)})
**Stats:** +${pullRequest.additions} / -${pullRequest.deletions} across ${pullRequest.changedFiles} files

**Description:**
${pullRequest.body || "(no description)"}

---

## Diff Summary

${diffText}

---

## Instructions

Analyze this Pull Request for meaningful engineering issues. Use the available tools to investigate further when needed.

Focus on: bugs, security, performance, reliability, and maintainability issues.

Produce your final response as a JSON object with:
- summary: concise review summary
- overall_assessment: "PASS" or "NEEDS_ATTENTION"
- findings: array of finding objects (max ${env.DIFFMIND_MAX_FINDINGS}, min confidence ${env.DIFFMIND_MIN_CONFIDENCE})

Each finding must have: file, line (optional), side, severity, category, title, description, recommendation (optional), confidence.

Only report findings on changed lines when possible.`;
  }
}