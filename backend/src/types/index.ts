export interface DiffLine {
  oldLine?: number;
  newLine?: number;
  type: "add" | "delete" | "context";
  content: string;
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface FileDiff {
  file: string;
  oldFile?: string;
  newFile?: string;
  hunks: DiffHunk[];
  additions: number;
  deletions: number;
  isBinary: boolean;
  isNew: boolean;
  isDeleted: boolean;
  isRenamed: boolean;
}

export interface ParsedDiff {
  files: FileDiff[];
  totalAdditions: number;
  totalDeletions: number;
  totalFiles: number;
}

export interface ChangedFileSummary {
  file: string;
  additions: number;
  deletions: number;
  isNew: boolean;
  isDeleted: boolean;
  isRenamed: boolean;
  oldFile?: string;
  newFile?: string;
}

export interface ReviewContext {
  repository: {
    id: string;
    name: string;
    fullName: string;
    ownerLogin: string;
    defaultBranch: string;
    private: boolean;
  };
  pullRequest: {
    id: string;
    number: number;
    title: string;
    body: string | null;
    authorLogin: string;
    authorAvatarUrl: string | null;
    sourceBranch: string;
    targetBranch: string;
    baseSha: string;
    headSha: string;
    additions: number;
    deletions: number;
    changedFiles: number;
  };
  diff: ParsedDiff;
  changedFiles: ChangedFileSummary[];
}

export interface Finding {
  file: string;
  line?: number;
  side?: "LEFT" | "RIGHT";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: "BUG" | "SECURITY" | "PERFORMANCE" | "RELIABILITY" | "MAINTAINABILITY";
  title: string;
  description: string;
  recommendation?: string;
  confidence: number;
}

export interface ReviewResult {
  summary: string;
  overallAssessment: "PASS" | "NEEDS_ATTENTION";
  findings: Finding[];
}

export interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
  id: string;
}

export interface ToolResult {
  callId: string;
  name: string;
  result: unknown;
  error?: string;
}

export interface AgentStep {
  step: number;
  reasoning?: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

export interface AgentState {
  steps: AgentStep[];
  context: ReviewContext;
  maxSteps: number;
  currentStep: number;
}

export interface GitHubPRFile {
  filename: string;
  status: "added" | "removed" | "modified" | "renamed" | "copied" | "changed" | "unchanged";
  additions: number;
  deletions: number;
  changes: number;
  blobUrl: string;
  rawUrl: string;
  contentsUrl: string;
  patch?: string;
  previousFilename?: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed" | "merged";
  head: {
    sha: string;
    ref: string;
    repo: { fullName: string; defaultBranch: string };
  };
  base: {
    sha: string;
    ref: string;
    repo: { fullName: string; defaultBranch: string };
  };
  user: { login: string; avatarUrl: string };
  additions: number;
  deletions: number;
  changedFiles: number;
}

export interface WebhookPayload {
  action: string;
  pull_request: GitHubPullRequest;
  repository: {
    id: number;
    name: string;
    full_name: string;
    owner: { login: string; avatar_url: string };
    private: boolean;
    default_branch: string;
  };
  installation: { id: number };
  sender: { login: string };
}