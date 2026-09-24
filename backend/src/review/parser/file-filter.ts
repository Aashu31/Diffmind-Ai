import { ParsedDiff, FileDiff } from "../../types";

export interface FileFilterConfig {
  maxFileSize: number;
  maxTotalSize: number;
  excludedPatterns: string[];
  includedExtensions: string[];
  excludedExtensions: string[];
}

export const DEFAULT_FILE_FILTER_CONFIG: FileFilterConfig = {
  maxFileSize: 100 * 1024,
  maxTotalSize: 2 * 1024 * 1024,
  excludedPatterns: [
    "node_modules/",
    "dist/",
    "build/",
    "coverage/",
    ".next/",
    "vendor/",
    ".git/",
    "__pycache__/",
    ".pytest_cache/",
    "target/",
    "bin/",
    "obj/",
  ],
  includedExtensions: [
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".py", ".rb", ".go", ".rs", ".java", ".kt", ".swift",
    ".cs", ".fs", ".vb",
    ".php", ".pl", ".pm",
    ".sh", ".bash", ".zsh", ".fish",
    ".json", ".yaml", ".yml", ".toml", ".ini", ".cfg",
    ".md", ".mdx", ".txt", ".rst",
    ".sql", ".graphql", ".gql",
    ".dockerfile", ".dockerignore",
    ".tf", ".tfvars",
    ".proto",
    ".sol", ".vy",
    ".move",
  ],
  excludedExtensions: [
    ".lock", ".map", ".min.js", ".min.css", ".d.ts",
    ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".svg",
    ".woff", ".woff2", ".ttf", ".eot", ".otf",
    ".pdf", ".zip", ".tar", ".gz", ".rar", ".7z",
    ".exe", ".dll", ".so", ".dylib",
    ".class", ".jar", ".war", ".ear",
    ".pyc", ".pyo", ".pyd",
    ".db", ".sqlite", ".sqlite3",
  ],
};

export function shouldIncludeFile(filename: string, config: FileFilterConfig = DEFAULT_FILE_FILTER_CONFIG): boolean {
  const lowerFilename = filename.toLowerCase();

  for (const pattern of config.excludedPatterns) {
    if (lowerFilename.includes(pattern.toLowerCase())) {
      return false;
    }
  }

  const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
  if (config.excludedExtensions.includes(ext)) {
    return false;
  }

  if (config.includedExtensions.length > 0) {
    if (!config.includedExtensions.includes(ext)) {
      const basename = filename.split("/").pop()?.toLowerCase() || "";
      const knownBasenames = ["dockerfile", "makefile", "rakefile", "gemfile", "podfile", "cargo.toml", "go.mod", "package.json", "tsconfig.json", ".gitignore", ".gitattributes", ".editorconfig", ".eslintrc", ".prettierrc"];
      if (!knownBasenames.includes(basename)) {
        return false;
      }
    }
  }

  return true;
}

export function filterFilesByConfig(diff: ParsedDiff, config: FileFilterConfig = DEFAULT_FILE_FILTER_CONFIG): ParsedDiff {
  const filteredFiles = diff.files.filter((f) => shouldIncludeFile(f.file, config) && !f.isBinary);
  const totalAdditions = filteredFiles.reduce((sum: number, f: FileDiff) => sum + f.additions, 0);
  const totalDeletions = filteredFiles.reduce((sum: number, f: FileDiff) => sum + f.deletions, 0);
  return {
    files: filteredFiles,
    totalAdditions,
    totalDeletions,
    totalFiles: filteredFiles.length,
  };
}

export function estimateFileSize(file: FileDiff): number {
  let size = 0;
  for (const hunk of file.hunks) {
    for (const line of hunk.lines) {
      size += line.content.length + 1;
    }
  }
  return size;
}

export function truncateLargeFiles(diff: ParsedDiff, config: FileFilterConfig = DEFAULT_FILE_FILTER_CONFIG): ParsedDiff {
  const filteredFiles: FileDiff[] = [];
  let totalSize = 0;

  for (const file of diff.files) {
    const fileSize = estimateFileSize(file);

    if (fileSize > config.maxFileSize) {
      const truncatedFile = truncateFile(file, config.maxFileSize);
      filteredFiles.push(truncatedFile);
      totalSize += config.maxFileSize;
    } else if (totalSize + fileSize > config.maxTotalSize) {
      const remainingBudget = config.maxTotalSize - totalSize;
      if (remainingBudget > 1024) {
        const truncatedFile = truncateFile(file, remainingBudget);
        filteredFiles.push(truncatedFile);
        totalSize += remainingBudget;
      }
      break;
    } else {
      filteredFiles.push(file);
      totalSize += fileSize;
    }
  }

  const totalAdditions = filteredFiles.reduce((sum: number, f: FileDiff) => sum + f.additions, 0);
  const totalDeletions = filteredFiles.reduce((sum: number, f: FileDiff) => sum + f.deletions, 0);
  return {
    files: filteredFiles,
    totalAdditions,
    totalDeletions,
    totalFiles: filteredFiles.length,
  };
}

function truncateFile(file: FileDiff, maxSize: number): FileDiff {
  const hunks: typeof file.hunks = [];
  let currentSize = 0;

  for (const hunk of file.hunks) {
    let hunkSize = 0;
    for (const line of hunk.lines) {
      hunkSize += line.content.length + 1;
    }

    if (currentSize + hunkSize <= maxSize) {
      hunks.push(hunk);
      currentSize += hunkSize;
    } else {
      const remainingBudget = maxSize - currentSize;
      if (remainingBudget > 200) {
        const truncatedHunk = truncateHunk(hunk, remainingBudget);
        if (truncatedHunk.lines.length > 0) {
          hunks.push(truncatedHunk);
        }
      }
      break;
    }
  }

  const additions = hunks.reduce((sum, h) => sum + h.lines.filter((l) => l.type === "add").length, 0);
  const deletions = hunks.reduce((sum, h) => sum + h.lines.filter((l) => l.type === "delete").length, 0);

  return {
    ...file,
    hunks,
    additions,
    deletions,
  };
}

function truncateHunk(hunk: FileDiff["hunks"][0], maxSize: number): FileDiff["hunks"][0] {
  const lines = [];
  let currentSize = 0;

  for (const line of hunk.lines) {
    const lineSize = line.content.length + 1;
    if (currentSize + lineSize <= maxSize) {
      lines.push(line);
      currentSize += lineSize;
    } else {
      break;
    }
  }

  return {
    ...hunk,
    lines,
  };
}