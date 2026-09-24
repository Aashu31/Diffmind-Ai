import { ReviewContext, ParsedDiff, FileDiff } from "../../types";
import { filterFilesByConfig, truncateLargeFiles, DEFAULT_FILE_FILTER_CONFIG } from "../parser/file-filter";
import { parseDiff } from "../parser/diff";

export interface BuildContextOptions {
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
  rawDiff: string;
  fileFilterConfig?: typeof DEFAULT_FILE_FILTER_CONFIG;
}

export function buildReviewContext(options: BuildContextOptions): ReviewContext {
  const rawParsed = parseDiff(options.rawDiff);
  const filtered = filterFilesByConfig(rawParsed, options.fileFilterConfig);
  const truncated = truncateLargeFiles(filtered, options.fileFilterConfig);

  const changedFiles = truncated.files.map((f) => ({
    file: f.file,
    additions: f.additions,
    deletions: f.deletions,
    isNew: f.isNew,
    isDeleted: f.isDeleted,
    isRenamed: f.isRenamed,
    oldFile: f.oldFile,
    newFile: f.newFile,
  }));

  return {
    repository: options.repository,
    pullRequest: options.pullRequest,
    diff: truncated,
    changedFiles,
  };
}

export function formatDiffForPrompt(diff: ParsedDiff, maxFileContext: number = 8000): string {
  const parts: string[] = [];

  parts.push("## Changed Files");
  parts.push("");
  parts.push(`Total files: ${diff.totalFiles}`);
  parts.push(`Total additions: ${diff.totalAdditions}`);
  parts.push(`Total deletions: ${diff.totalDeletions}`);
  parts.push("");

  let currentLength = parts.join("\n").length;

  for (const file of diff.files) {
    const fileHeader = `### ${file.file} (+${file.additions}/-${file.deletions})${file.isNew ? " [NEW]" : ""}${file.isDeleted ? " [DELETED]" : ""}${file.isRenamed ? ` [RENAMED from ${file.oldFile}]` : ""}`;
    const fileHeaderLength = fileHeader.length;

    if (currentLength + fileHeaderLength > maxFileContext) {
      parts.push("... (remaining files truncated)");
      break;
    }

    parts.push(fileHeader);
    parts.push("");

    for (const hunk of file.hunks) {
      const hunkLines = hunk.lines
        .map((l) => {
          const prefix = l.type === "add" ? "+" : l.type === "delete" ? "-" : " ";
          const lineNum = l.type === "add" ? l.newLine : l.type === "delete" ? l.oldLine : l.newLine ?? l.oldLine;
          return `${prefix}${lineNum?.toString().padStart(4) || "    "} ${l.content}`;
        })
        .join("\n");

      const hunkBlock = `\`\`\`diff\n${hunkLines}\n\`\`\``;
      const hunkLength = hunkBlock.length;

      if (currentLength + hunkLength > maxFileContext) {
        parts.push("... (hunk truncated)");
        break;
      }

      parts.push(hunkBlock);
      parts.push("");
      currentLength += hunkLength;
    }

    currentLength += fileHeaderLength;
  }

  return parts.join("\n");
}

export function getFileLanguage(filename: string): string {
  const ext = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
  const languageMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    mjs: "javascript",
    cjs: "javascript",
    py: "python",
    rb: "ruby",
    go: "go",
    rs: "rust",
    java: "java",
    kt: "kotlin",
    swift: "swift",
    cs: "csharp",
    fs: "fsharp",
    vb: "vbnet",
    php: "php",
    pl: "perl",
    pm: "perl",
    sh: "bash",
    bash: "bash",
    zsh: "bash",
    fish: "fish",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    ini: "ini",
    cfg: "ini",
    md: "markdown",
    mdx: "markdown",
    txt: "text",
    rst: "rst",
    sql: "sql",
    graphql: "graphql",
    gql: "graphql",
    dockerfile: "dockerfile",
    dockerignore: "dockerignore",
    tf: "hcl",
    tfvars: "hcl",
    proto: "protobuf",
    sol: "solidity",
    vy: "vyper",
    move: "move",
  };
  return languageMap[ext] || "text";
}

export function extractRelevantContext(
  diff: ParsedDiff,
  file: string,
  line: number,
  side: "LEFT" | "RIGHT",
  contextLines: number = 10
): string {
  const fileDiff = diff.files.find((f) => f.file === file);
  if (!fileDiff) return "";

  const targetLine = side === "LEFT" ? "oldLine" : "newLine";
  const lines: string[] = [];

  for (const hunk of fileDiff.hunks) {
    for (const l of hunk.lines) {
      const lnum = targetLine === "oldLine" ? l.oldLine : l.newLine;
      if (lnum !== undefined && Math.abs(lnum - line) <= contextLines) {
        const prefix = l.type === "add" ? "+" : l.type === "delete" ? "-" : " ";
        const lineNum = l.type === "add" ? l.newLine : l.type === "delete" ? l.oldLine : l.newLine ?? l.oldLine;
        lines.push(`${prefix}${lineNum?.toString().padStart(4) || "    "} ${l.content}`);
      }
    }
  }

  return lines.join("\n");
}