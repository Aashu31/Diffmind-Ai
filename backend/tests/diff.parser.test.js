"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const diff_1 = require("../src/review/parser/diff");
const diff_2 = require("../src/review/parser/diff");
const file_filter_1 = require("../src/review/parser/file-filter");
const findings_1 = require("../src/review/validation/findings");
const builder_1 = require("../src/review/context/builder");
(0, vitest_1.describe)("Diff Parser", () => {
    const sampleDiff = `diff --git a/src/auth.ts b/src/auth.ts
index 1234567..abcdefg 100644
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -10,7 +10,7 @@ export function authenticate(token: string) {
-  const user = db.users.find(u => u.token === token);
+  const user = await db.users.find(u => u.token === token);
   if (!user) throw new Error("Unauthorized");
   return user;
@@ -25,6 +25,8 @@ export function authorize(user: User, resource: string) {
+  if (!user.permissions.includes(resource)) {
+    throw new Error("Forbidden");
+  }
   return true;
 }
diff --git a/src/utils.ts b/src/utils.ts
index abcdefg..1234567 100644
--- a/src/utils.ts
+++ b/src/utils.ts
@@ -1,3 +1,5 @@
+import { logger } from "./logger";
+
 export function formatDate(date: Date) {
   return date.toISOString();
 }
diff --git a/package-lock.json b/package-lock.json
deleted file mode 100644
index 1234567..0000000
--- a/package-lock.json
+++ /dev/null
@@ -1,3 +0,0 @@
-{
-  "lockfileVersion": 2
-}
`;
    (0, vitest_1.it)("parses diff correctly", () => {
        const parsed = (0, diff_1.parseDiff)(sampleDiff);
        (0, vitest_1.expect)(parsed.totalFiles).toBe(3);
        (0, vitest_1.expect)(parsed.files.length).toBe(3);
        const authFile = parsed.files.find((f) => f.file === "src/auth.ts");
        (0, vitest_1.expect)(authFile).toBeDefined();
        (0, vitest_1.expect)(authFile.hunks.length).toBe(2);
        (0, vitest_1.expect)(authFile.additions).toBeGreaterThan(0);
        (0, vitest_1.expect)(authFile.deletions).toBeGreaterThan(0);
        const utilsFile = parsed.files.find((f) => f.file === "src/utils.ts");
        (0, vitest_1.expect)(utilsFile).toBeDefined();
        (0, vitest_1.expect)(utilsFile.isNew).toBe(false);
        const lockFile = parsed.files.find((f) => f.file === "package-lock.json");
        (0, vitest_1.expect)(lockFile).toBeDefined();
        (0, vitest_1.expect)(lockFile.isDeleted).toBe(true);
    });
    (0, vitest_1.it)("filters excluded files", () => {
        const parsed = (0, diff_1.parseDiff)(sampleDiff);
        const filtered = (0, diff_1.filterDiff)(parsed);
        (0, vitest_1.expect)(filtered.files.find((f) => f.file === "package-lock.json")).toBeUndefined();
        (0, vitest_1.expect)(filtered.files.find((f) => f.file === "src/auth.ts")).toBeDefined();
        (0, vitest_1.expect)(filtered.files.find((f) => f.file === "src/utils.ts")).toBeDefined();
    });
});
(0, vitest_1.describe)("File Filter", () => {
    (0, vitest_1.it)("excludes node_modules", () => {
        (0, vitest_1.expect)((0, diff_2.shouldExcludeFile)("node_modules/package/index.js")).toBe(true);
        (0, vitest_1.expect)((0, diff_2.shouldExcludeFile)("src/node_modules/package/index.js")).toBe(true);
    });
    (0, vitest_1.it)("excludes build directories", () => {
        (0, vitest_1.expect)((0, diff_2.shouldExcludeFile)("dist/bundle.js")).toBe(true);
        (0, vitest_1.expect)((0, diff_2.shouldExcludeFile)("build/output.js")).toBe(true);
        (0, vitest_1.expect)((0, diff_2.shouldExcludeFile)(".next/server.js")).toBe(true);
        (0, vitest_1.expect)((0, diff_2.shouldExcludeFile)("coverage/lcov.info")).toBe(true);
    });
    (0, vitest_1.it)("excludes binary extensions", () => {
        (0, vitest_1.expect)((0, diff_2.shouldExcludeFile)("image.png")).toBe(true);
        (0, vitest_1.expect)((0, diff_2.shouldExcludeFile)("font.woff2")).toBe(true);
        (0, vitest_1.expect)((0, diff_2.shouldExcludeFile)("binary.exe")).toBe(true);
    });
    (0, vitest_1.it)("includes source files", () => {
        (0, vitest_1.expect)((0, file_filter_1.shouldIncludeFile)("src/main.ts", file_filter_1.DEFAULT_FILE_FILTER_CONFIG)).toBe(true);
        (0, vitest_1.expect)((0, file_filter_1.shouldIncludeFile)("src/components/Button.tsx", file_filter_1.DEFAULT_FILE_FILTER_CONFIG)).toBe(true);
        (0, vitest_1.expect)((0, file_filter_1.shouldIncludeFile)("lib/utils.py", file_filter_1.DEFAULT_FILE_FILTER_CONFIG)).toBe(true);
        (0, vitest_1.expect)((0, file_filter_1.shouldIncludeFile)("scripts/deploy.sh", file_filter_1.DEFAULT_FILE_FILTER_CONFIG)).toBe(true);
    });
    (0, vitest_1.it)("filters parsed diff by config", () => {
        const diff = `diff --git a/src/main.ts b/src/main.ts
index 123..456 100644
--- a/src/main.ts
+++ b/src/main.ts
@@ -1 +1 @@
-console.log("old")
+console.log("new")
diff --git a/node_modules/pkg/index.js b/node_modules/pkg/index.js
index 123..456 100644
--- a/node_modules/pkg/index.js
+++ b/node_modules/pkg/index.js
@@ -1 +1 @@
-old()
+new()
`;
        const parsed = (0, diff_1.parseDiff)(diff);
        const filtered = (0, file_filter_1.filterFilesByConfig)(parsed);
        (0, vitest_1.expect)(filtered.files.length).toBe(1);
        (0, vitest_1.expect)(filtered.files[0].file).toBe("src/main.ts");
    });
});
(0, vitest_1.describe)("Finding Validation", () => {
    const mockDiff = {
        files: [
            {
                file: "src/auth.ts",
                hunks: [
                    {
                        oldStart: 10,
                        oldLines: 5,
                        newStart: 10,
                        newLines: 5,
                        lines: [
                            { oldLine: 10, newLine: 10, type: "context", content: "export function authenticate(token: string) {" },
                            { oldLine: 11, newLine: 11, type: "delete", content: "  const user = db.users.find(u => u.token === token);" },
                            { oldLine: 12, newLine: 12, type: "add", content: "  const user = await db.users.find(u => u.token === token);" },
                            { oldLine: 13, newLine: 13, type: "context", content: "  if (!user) throw new Error(\"Unauthorized\");" },
                            { oldLine: 14, newLine: 14, type: "context", content: "  return user;" },
                        ],
                    },
                ],
                additions: 1,
                deletions: 1,
                isBinary: false,
                isNew: false,
                isDeleted: false,
                isRenamed: false,
            },
        ],
        totalAdditions: 1,
        totalDeletions: 1,
        totalFiles: 1,
    };
    (0, vitest_1.it)("validates correct finding schema", () => {
        const finding = {
            file: "src/auth.ts",
            line: 12,
            side: "RIGHT",
            severity: "HIGH",
            category: "BUG",
            title: "Missing await",
            description: "The database query is missing await",
            recommendation: "Add await before the database call",
            confidence: 0.9,
        };
        const result = (0, findings_1.validateAndProcessFindings)([finding], mockDiff);
        (0, vitest_1.expect)(result.valid.length).toBe(1);
        (0, vitest_1.expect)(result.rejected.length).toBe(0);
    });
    (0, vitest_1.it)("rejects finding with invalid line", () => {
        const finding = {
            file: "src/auth.ts",
            line: 999,
            side: "RIGHT",
            severity: "HIGH",
            category: "BUG",
            title: "Invalid line",
            description: "This line doesn't exist",
            confidence: 0.9,
        };
        const result = (0, findings_1.validateAndProcessFindings)([finding], mockDiff);
        (0, vitest_1.expect)(result.valid.length).toBe(0);
        (0, vitest_1.expect)(result.rejected.length).toBe(1);
        (0, vitest_1.expect)(result.rejected[0].reason).toContain("does not exist");
    });
    (0, vitest_1.it)("rejects finding with low confidence", () => {
        const finding = {
            file: "src/auth.ts",
            line: 12,
            side: "RIGHT",
            severity: "HIGH",
            category: "BUG",
            title: "Low confidence",
            description: "This might be an issue",
            confidence: 0.5,
        };
        const result = (0, findings_1.validateAndProcessFindings)([finding], mockDiff);
        (0, vitest_1.expect)(result.valid.length).toBe(0);
        (0, vitest_1.expect)(result.rejected.length).toBe(1);
        (0, vitest_1.expect)(result.rejected[0].reason).toContain("confidence");
    });
    (0, vitest_1.it)("deduplicates findings", () => {
        const finding1 = {
            file: "src/auth.ts",
            line: 12,
            side: "RIGHT",
            severity: "HIGH",
            category: "BUG",
            title: "Duplicate issue",
            description: "First instance",
            confidence: 0.8,
        };
        const finding2 = {
            file: "src/auth.ts",
            line: 12,
            side: "RIGHT",
            severity: "HIGH",
            category: "BUG",
            title: "Duplicate issue",
            description: "Second instance",
            confidence: 0.9,
        };
        const result = (0, findings_1.validateAndProcessFindings)([finding1, finding2], mockDiff);
        (0, vitest_1.expect)(result.valid.length).toBe(1);
        (0, vitest_1.expect)(result.valid[0].confidence).toBe(0.9);
    });
});
(0, vitest_1.describe)("Review Context Builder", () => {
    (0, vitest_1.it)("builds context from diff", () => {
        const diff = `diff --git a/src/test.ts b/src/test.ts
index 123..456 100644
--- a/src/test.ts
+++ b/src/test.ts
@@ -1,3 +1,4 @@
+import { foo } from "./bar";
 export function test() {
   return 42;
 }
`;
        const context = (0, builder_1.buildReviewContext)({
            repository: {
                id: "repo-1",
                name: "test-repo",
                fullName: "owner/test-repo",
                ownerLogin: "owner",
                defaultBranch: "main",
                private: false,
            },
            pullRequest: {
                id: "pr-1",
                number: 42,
                title: "Test PR",
                body: "Test description",
                authorLogin: "author",
                authorAvatarUrl: "https://github.com/author.png",
                sourceBranch: "feature",
                targetBranch: "main",
                baseSha: "abc123",
                headSha: "def456",
                additions: 1,
                deletions: 0,
                changedFiles: 1,
            },
            rawDiff: diff,
        });
        (0, vitest_1.expect)(context.repository.fullName).toBe("owner/test-repo");
        (0, vitest_1.expect)(context.pullRequest.number).toBe(42);
        (0, vitest_1.expect)(context.diff.totalFiles).toBe(1);
        (0, vitest_1.expect)(context.changedFiles.length).toBe(1);
    });
    (0, vitest_1.it)("formats diff for prompt", () => {
        const diff = `diff --git a/src/test.ts b/src/test.ts
index 123..456 100644
--- a/src/test.ts
+++ b/src/test.ts
@@ -1,3 +1,4 @@
+import { foo } from "./bar";
 export function test() {
   return 42;
 }
`;
        const parsed = (0, diff_1.parseDiff)(diff);
        const formatted = (0, builder_1.formatDiffForPrompt)(parsed);
        (0, vitest_1.expect)(formatted).toContain("src/test.ts");
        (0, vitest_1.expect)(formatted).toContain("import { foo }");
        (0, vitest_1.expect)(formatted).toContain("+");
    });
});
(0, vitest_1.describe)("Environment Config", () => {
    (0, vitest_1.it)("has required env vars defined", () => {
        (0, vitest_1.expect)(process.env.NVIDIA_BASE_URL).toBeDefined();
        (0, vitest_1.expect)(process.env.NVIDIA_MODEL).toBeDefined();
    });
});
//# sourceMappingURL=diff.parser.test.js.map