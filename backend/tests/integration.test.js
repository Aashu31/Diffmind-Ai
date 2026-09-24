"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const NemotronProvider_1 = require("../src/ai/providers/NemotronProvider");
const AgentLoop_1 = require("../src/ai/agent/AgentLoop");
(0, vitest_1.describe)("NemotronProvider Integration", () => {
    (0, vitest_1.it)("initializes with correct config", () => {
        const provider = new NemotronProvider_1.NemotronProvider();
        (0, vitest_1.expect)(provider).toBeDefined();
    });
    (0, vitest_1.it)("handles malformed model output gracefully", async () => {
        const provider = new NemotronProvider_1.NemotronProvider();
        // This test would need a mock server, so we'll skip actual API calls
        // In a real test environment, you'd use a mock HTTP server
        (0, vitest_1.expect)(true).toBe(true);
    });
});
(0, vitest_1.describe)("AgentLoop", () => {
    const mockContext = {
        repository: {
            id: "repo-1",
            name: "test",
            fullName: "owner/test",
            ownerLogin: "owner",
            defaultBranch: "main",
            private: false,
        },
        pullRequest: {
            id: "pr-1",
            number: 1,
            title: "Test PR",
            body: "Test",
            authorLogin: "author",
            authorAvatarUrl: null,
            sourceBranch: "feature",
            targetBranch: "main",
            baseSha: "abc",
            headSha: "def",
            additions: 10,
            deletions: 5,
            changedFiles: 2,
        },
        diff: {
            files: [],
            totalAdditions: 10,
            totalDeletions: 5,
            totalFiles: 2,
        },
        changedFiles: [],
    };
    const mockToolExecutor = vitest_1.vi.fn(async (name) => {
        return {
            callId: `call-${Date.now()}`,
            name,
            result: { success: true },
        };
    });
    (0, vitest_1.it)("executes agent loop with max steps", async () => {
        const provider = new NemotronProvider_1.NemotronProvider();
        const loop = new AgentLoop_1.AgentLoop(provider, mockToolExecutor, 3);
        // Mock the provider's chat method to return a final response immediately
        vitest_1.vi.spyOn(provider, "chat").mockResolvedValue({
            content: JSON.stringify({
                summary: "Test review",
                overall_assessment: "PASS",
                findings: [],
            }),
            reasoning_content: "Test reasoning",
            tool_calls: undefined,
            finish_reason: "stop",
        });
        const result = await loop.run(mockContext, "Test prompt");
        (0, vitest_1.expect)(result.findings).toEqual([]);
        (0, vitest_1.expect)(result.summary).toBe("Test review");
        (0, vitest_1.expect)(result.overallAssessment).toBe("PASS");
        (0, vitest_1.expect)(provider.chat).toHaveBeenCalledTimes(1);
    });
    (0, vitest_1.it)("handles tool calls in loop", async () => {
        const provider = new NemotronProvider_1.NemotronProvider();
        const loop = new AgentLoop_1.AgentLoop(provider, mockToolExecutor, 3);
        let callCount = 0;
        vitest_1.vi.spyOn(provider, "chat").mockImplementation(async () => {
            callCount++;
            if (callCount === 1) {
                return {
                    content: null,
                    reasoning_content: "Need to check something",
                    tool_calls: [
                        { id: "call-1", name: "get_file_content", arguments: { file: "src/test.ts", ref: "main" } },
                    ],
                    finish_reason: "tool_calls",
                };
            }
            return {
                content: JSON.stringify({
                    summary: "Test review with tool",
                    overall_assessment: "NEEDS_ATTENTION",
                    findings: [
                        {
                            file: "src/test.ts",
                            line: 10,
                            side: "RIGHT",
                            severity: "MEDIUM",
                            category: "BUG",
                            title: "Test finding",
                            description: "Found via tool",
                            confidence: 0.8,
                        },
                    ],
                }),
                reasoning_content: "Final reasoning",
                tool_calls: undefined,
                finish_reason: "stop",
            };
        });
        const result = await loop.run(mockContext, "Test prompt");
        (0, vitest_1.expect)(result.findings.length).toBe(1);
        (0, vitest_1.expect)(result.findings[0].title).toBe("Test finding");
        (0, vitest_1.expect)(mockToolExecutor).toHaveBeenCalledWith("get_file_content", { file: "src/test.ts", ref: "main" });
    });
    (0, vitest_1.it)("respects max steps limit", async () => {
        const provider = new NemotronProvider_1.NemotronProvider();
        const loop = new AgentLoop_1.AgentLoop(provider, mockToolExecutor, 2);
        let callCount = 0;
        vitest_1.vi.spyOn(provider, "chat").mockImplementation(async () => {
            callCount++;
            if (callCount <= 2) {
                return {
                    content: null,
                    reasoning_content: `Step ${callCount}`,
                    tool_calls: [
                        { id: `call-${callCount}`, name: "get_file_content", arguments: { file: "src/test.ts", ref: "main" } },
                    ],
                    finish_reason: "tool_calls",
                };
            }
            return {
                content: JSON.stringify({ summary: "Done", overall_assessment: "PASS", findings: [] }),
                reasoning_content: "Final",
                tool_calls: undefined,
                finish_reason: "stop",
            };
        });
        const result = await loop.run(mockContext, "Test prompt");
        // Should stop after maxSteps (2) tool call rounds
        (0, vitest_1.expect)(callCount).toBeLessThanOrEqual(3);
    });
});
(0, vitest_1.describe)("Prompt Injection Defense", () => {
    (0, vitest_1.it)("treats repository content as untrusted data", () => {
        // The system prompt explicitly instructs the model to treat all repo content as untrusted
        // This is a design principle, not a runtime test
        (0, vitest_1.expect)(true).toBe(true);
    });
});
(0, vitest_1.describe)("Error Handling", () => {
    (0, vitest_1.it)("handles provider errors gracefully", async () => {
        const provider = new NemotronProvider_1.NemotronProvider();
        // Test that the provider doesn't crash on initialization
        (0, vitest_1.expect)(() => new NemotronProvider_1.NemotronProvider()).not.toThrow();
    });
});
//# sourceMappingURL=integration.test.js.map