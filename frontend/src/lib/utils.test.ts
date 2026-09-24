import { describe, it, expect } from "vitest";
import { cn, formatRelativeTime, getSeverityColor, getCategoryColor, getAssessmentColor, getJobStatusColor } from "./utils";

describe("Utility Functions", () => {
  describe("cn", () => {
    it("merges class names correctly", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
      expect(cn("foo", false && "bar")).toBe("foo");
      expect(cn("foo", null, "bar")).toBe("foo bar");
    });

    it("handles tailwind conflicts", () => {
      expect(cn("p-2 p-4")).toBe("p-4");
      expect(cn("text-red-500 text-blue-500")).toBe("text-blue-500");
    });
  });

  describe("formatRelativeTime", () => {
    it("formats recent times", () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      expect(formatRelativeTime(oneMinuteAgo)).toBe("1m ago");
      expect(formatRelativeTime(oneHourAgo)).toBe("1h ago");
      expect(formatRelativeTime(oneDayAgo)).toBe("1d ago");
      expect(formatRelativeTime(oneWeekAgo)).toMatch(/Sep|Oct|Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug/);
    });
  });

  describe("getSeverityColor", () => {
    it("returns correct colors for each severity", () => {
      expect(getSeverityColor("CRITICAL")).toContain("red");
      expect(getSeverityColor("HIGH")).toContain("orange");
      expect(getSeverityColor("MEDIUM")).toContain("yellow");
      expect(getSeverityColor("LOW")).toContain("blue");
      expect(getSeverityColor("UNKNOWN")).toContain("gray");
    });
  });

  describe("getCategoryColor", () => {
    it("returns correct colors for each category", () => {
      expect(getCategoryColor("BUG")).toContain("red");
      expect(getCategoryColor("SECURITY")).toContain("purple");
      expect(getCategoryColor("PERFORMANCE")).toContain("amber");
      expect(getCategoryColor("RELIABILITY")).toContain("green");
      expect(getCategoryColor("MAINTAINABILITY")).toContain("indigo");
      expect(getCategoryColor("UNKNOWN")).toContain("gray");
    });
  });

  describe("getAssessmentColor", () => {
    it("returns correct colors for assessments", () => {
      expect(getAssessmentColor("PASS")).toContain("green");
      expect(getAssessmentColor("NEEDS_ATTENTION")).toContain("orange");
      expect(getAssessmentColor("UNKNOWN")).toContain("gray");
    });
  });

  describe("getJobStatusColor", () => {
    it("returns correct colors for job statuses", () => {
      expect(getJobStatusColor("PENDING")).toContain("gray");
      expect(getJobStatusColor("PROCESSING")).toContain("blue");
      expect(getJobStatusColor("COMPLETED")).toContain("green");
      expect(getJobStatusColor("FAILED")).toContain("red");
      expect(getJobStatusColor("CANCELLED")).toContain("gray");
    });
  });
});