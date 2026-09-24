import { ParsedDiff, FileDiff, DiffHunk, DiffLine } from "../../types";

const EXCLUDED_PATTERNS = [
  /node_modules\//,
  /dist\//,
  /build\//,
  /coverage\//,
  /\.next\//,
  /vendor\//,
  /\.lock$/,
  /\.map$/,
  /\.min\.js$/,
  /\.min\.css$/,
  /\.d\.ts$/,
];

const BINARY_EXTENSIONS = [
  ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".svg",
  ".woff", ".woff2", ".ttf", ".eot", ".otf",
  ".pdf", ".zip", ".tar", ".gz", ".rar", ".7z",
  ".exe", ".dll", ".so", ".dylib",
  ".class", ".jar", ".war", ".ear",
  ".pyc", ".pyo", ".pyd",
  ".db", ".sqlite", ".sqlite3",
];

export function shouldExcludeFile(filename: string): boolean {
  if (EXCLUDED_PATTERNS.some((pattern) => pattern.test(filename))) {
    return true;
  }
  const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
  if (BINARY_EXTENSIONS.includes(ext)) {
    return true;
  }
  return false;
}

function parseHunkHeader(header: string): { oldStart: number; oldLines: number; newStart: number; newLines: number } | null {
  const match = header.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
  if (!match) return null;
  const oldStart = parseInt(match[1], 10);
  const oldLines = match[2] ? parseInt(match[2], 10) : 1;
  const newStart = parseInt(match[3], 10);
  const newLines = match[4] ? parseInt(match[4], 10) : 1;
  return { oldStart, oldLines, newStart, newLines };
}

function parseDiffLines(hunkContent: string): DiffLine[] {
  const lines: DiffLine[] = [];
  let oldLineNum: number | undefined;
  let newLineNum: number | undefined;

  const contentLines = hunkContent.split("\n");

  for (const line of contentLines) {
    if (line.startsWith("+")) {
      lines.push({ newLine: newLineNum, type: "add", content: line.slice(1) });
      newLineNum = (newLineNum ?? 0) + 1;
    } else if (line.startsWith("-")) {
      lines.push({ oldLine: oldLineNum, type: "delete", content: line.slice(1) });
      oldLineNum = (oldLineNum ?? 0) + 1;
    } else if (line.startsWith(" ")) {
      lines.push({ oldLine: oldLineNum, newLine: newLineNum, type: "context", content: line.slice(1) });
      oldLineNum = (oldLineNum ?? 0) + 1;
      newLineNum = (newLineNum ?? 0) + 1;
    } else if (line.startsWith("\\")) {
      continue;
    }
  }

  return lines;
}

export function parseDiff(diff: string): ParsedDiff {
  const files: FileDiff[] = [];
  let currentFile: Partial<FileDiff> | null = null;
  let currentHunk: DiffHunk | null = null;
  let hunkContent = "";

  const lines = diff.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("diff --git ")) {
      if (currentFile && currentHunk) {
        currentHunk.lines = parseDiffLines(hunkContent);
        currentFile.hunks!.push(currentHunk);
      }
      if (currentFile) {
        files.push(currentFile as FileDiff);
      }

      const match = line.match(/^diff --git a\/(.+) b\/(.+)$/);
      if (!match) {
        i++;
        continue;
      }

      const oldFile = match[1];
      const newFile = match[2];
      const isNew = oldFile === "/dev/null";
      const isDeleted = newFile === "/dev/null";
      const isRenamed = !isNew && !isDeleted && oldFile !== newFile;

      currentFile = {
        file: isNew ? newFile : oldFile,
        oldFile: isNew ? undefined : oldFile,
        newFile: isDeleted ? undefined : newFile,
        hunks: [],
        additions: 0,
        deletions: 0,
        isBinary: false,
        isNew,
        isDeleted,
        isRenamed,
      };
      hunkContent = "";
    } else if (line.startsWith("new file mode") || line.startsWith("deleted file mode") || line.startsWith("index ")) {
      // Skip metadata lines
    } else if (line.startsWith("Binary files ")) {
      if (currentFile) {
        currentFile.isBinary = true;
      }
    } else if (line.startsWith("@@ ")) {
      if (currentFile && currentHunk) {
        currentHunk.lines = parseDiffLines(hunkContent);
        currentFile.hunks!.push(currentHunk);
      }

      const parsed = parseHunkHeader(line);
      if (parsed) {
        currentHunk = {
          ...parsed,
          lines: [],
        };
        hunkContent = "";
      } else {
        currentHunk = null;
      }
    } else if (currentHunk && currentFile) {
      hunkContent += line + "\n";
    }

    i++;
  }

  if (currentFile && currentHunk) {
    currentHunk.lines = parseDiffLines(hunkContent);
    currentFile.hunks!.push(currentHunk);
  }
  if (currentFile) {
    files.push(currentFile as FileDiff);
  }

  for (const file of files) {
    for (const hunk of file.hunks) {
      for (const line of hunk.lines) {
        if (line.type === "add") file.additions++;
        else if (line.type === "delete") file.deletions++;
      }
    }
  }

  const totalAdditions = files.reduce((sum: number, f: FileDiff) => sum + f.additions, 0);
  const totalDeletions = files.reduce((sum: number, f: FileDiff) => sum + f.deletions, 0);

  return {
    files,
    totalAdditions,
    totalDeletions,
    totalFiles: files.length,
  };
}

export function filterDiff(parsed: ParsedDiff): ParsedDiff {
  const filteredFiles = parsed.files.filter((f) => !shouldExcludeFile(f.file) && !f.isBinary);
  const totalAdditions = filteredFiles.reduce((sum: number, f: FileDiff) => sum + f.additions, 0);
  const totalDeletions = filteredFiles.reduce((sum: number, f: FileDiff) => sum + f.deletions, 0);
  return {
    files: filteredFiles,
    totalAdditions,
    totalDeletions,
    totalFiles: filteredFiles.length,
  };
}