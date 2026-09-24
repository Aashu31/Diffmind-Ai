import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "CRITICAL":
      return "bg-dm-critical/15 text-dm-critical border-dm-critical/30";
    case "HIGH":
      return "bg-dm-warning/15 text-dm-warning border-dm-warning/30";
    case "MEDIUM":
      return "bg-dm-accent-amber/15 text-dm-accent-amber border-dm-accent-amber/30";
    case "LOW":
      return "bg-dm-neutral/15 text-dm-neutral border-dm-neutral/30";
    default:
      return "bg-dm-bg-border text-dm-text-muted border-dm-bg-border-strong";
  }
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case "BUG":
      return "bg-dm-critical/15 text-dm-critical border-dm-critical/30";
    case "SECURITY":
      return "bg-dm-warning/15 text-dm-warning border-dm-warning/30";
    case "PERFORMANCE":
      return "bg-dm-accent-amber/15 text-dm-accent-amber border-dm-accent-amber/30";
    case "RELIABILITY":
      return "bg-dm-success/15 text-dm-success border-dm-success/30";
    case "MAINTAINABILITY":
      return "bg-dm-neutral/15 text-dm-neutral border-dm-neutral/30";
    default:
      return "bg-dm-bg-border text-dm-text-muted border-dm-bg-border-strong";
  }
}

export function getAssessmentColor(assessment: string): string {
  switch (assessment) {
    case "PASS":
      return "bg-dm-success/15 text-dm-success border-dm-success/30";
    case "NEEDS_ATTENTION":
      return "bg-dm-warning/15 text-dm-warning border-dm-warning/30";
    default:
      return "bg-dm-bg-border text-dm-text-muted border-dm-bg-border-strong";
  }
}

export function getJobStatusColor(status: string): string {
  switch (status) {
    case "PENDING":
      return "bg-dm-bg-border text-dm-text-muted border-dm-bg-border-strong";
    case "PROCESSING":
      return "bg-dm-accent-amber/15 text-dm-accent-amber border-dm-accent-amber/30 animate-pulse-slow";
    case "COMPLETED":
      return "bg-dm-success/15 text-dm-success border-dm-success/30";
    case "FAILED":
      return "bg-dm-critical/15 text-dm-critical border-dm-critical/30";
    case "CANCELLED":
      return "bg-dm-bg-border text-dm-text-muted border-dm-bg-border-strong";
    default:
      return "bg-dm-bg-border text-dm-text-muted border-dm-bg-border-strong";
  }
}

export function getSeverityIcon(severity: string) {
  switch (severity) {
    case "CRITICAL":
      return "triangle-alert";
    case "HIGH":
      return "alert-circle";
    case "MEDIUM":
      return "alert-triangle";
    case "LOW":
      return "info";
    default:
      return "help-circle";
  }
}

export function getCategoryIcon(category: string) {
  switch (category) {
    case "BUG":
      return "bug";
    case "SECURITY":
      return "shield-alert";
    case "PERFORMANCE":
      return "gauge";
    case "RELIABILITY":
      return "check-circle-2";
    case "MAINTAINABILITY":
      return "wrench";
    default:
      return "help-circle";
  }
}