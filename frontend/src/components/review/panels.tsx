"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  accent?: "amber" | "success" | "critical" | "none";
  padding?: "none" | "sm" | "md" | "lg";
}

export function Panel({ children, className, elevated, accent = "none", padding = "md" }: PanelProps) {
  const accentStyles = {
    amber: "border-l-2 border-l-dm-accent-amber/50",
    success: "border-l-2 border-l-dm-success/50",
    critical: "border-l-2 border-l-dm-critical/50",
    none: "",
  };

  const paddingStyles = {
    none: "p-0",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={cn(
        "rounded-lg border bg-dm-bg-raised transition-all duration-200",
        elevated && "shadow-dm-panel-elevated border-dm-bg-border-strong",
        !elevated && "border-dm-bg-border shadow-dm-panel",
        "hover:border-dm-bg-border-strong hover:shadow-dm-panel-elevated",
        accentStyles[accent],
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

interface CodeLineProps {
  line: string;
  type?: "add" | "remove" | "context";
  number?: number;
  highlight?: boolean;
}

export function CodeLine({ line, type = "context", number, highlight }: CodeLineProps) {
  const typeStyles = {
    add: "bg-dm-success/10 text-dm-success",
    remove: "bg-dm-critical/10 text-dm-critical",
    context: "text-dm-text-secondary",
  };

  return (
    <div className={cn("flex gap-3 px-3 py-1.5 font-mono text-sm leading-relaxed", typeStyles[type], highlight && "bg-dm-accent-amber/5")}>
      {number !== undefined && (
        <span className="w-8 text-right text-dm-text-dim select-none -ml-2 mr-2 border-r border-dm-bg-border pr-2">
          {number}
        </span>
      )}
      <span className="flex-1 whitespace-pre-wrap break-all">{line}</span>
    </div>
  );
}

interface FindingCardProps {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: "BUG" | "SECURITY" | "PERFORMANCE" | "RELIABILITY" | "MAINTAINABILITY";
  title: string;
  description: string;
  file: string;
  line?: number;
  recommendation?: string;
  confidence: number;
  onView?: () => void;
}

export function FindingCard({ severity, category, title, description, file, line, recommendation, confidence, onView }: FindingCardProps) {
  const severityColors = {
    CRITICAL: "bg-dm-critical/15 border-dm-critical/30 text-dm-critical",
    HIGH: "bg-dm-warning/15 border-dm-warning/30 text-dm-warning",
    MEDIUM: "bg-dm-accent-amber/15 border-dm-accent-amber/30 text-dm-accent-amber",
    LOW: "bg-dm-neutral/15 border-dm-neutral/30 text-dm-neutral",
  };

  const categoryIcons = {
    BUG: "🐛",
    SECURITY: "🔒",
    PERFORMANCE: "⚡",
    RELIABILITY: "🛡️",
    MAINTAINABILITY: "🔧",
  };

  return (
    <Panel accent={severity === "CRITICAL" ? "critical" : severity === "HIGH" ? "critical" : severity === "MEDIUM" ? "amber" : "none"} padding="md">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-dm-bg-surface border border-dm-bg-border">
          {categoryIcons[category]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={cn("px-2 py-0.5 text-xs font-medium rounded border", severityColors[severity])}>
              {severity}
            </span>
            <span className="px-2 py-0.5 text-xs font-medium rounded border border-dm-bg-border bg-dm-bg-raised text-dm-text-secondary">
              {category}
            </span>
            <span className="px-2 py-0.5 text-xs font-medium rounded border border-dm-bg-border bg-dm-bg-raised text-dm-text-muted">
              {Math.round(confidence * 100)}% confidence
            </span>
          </div>
          <h4 className="font-semibold text-dm-text-primary mb-1">{title}</h4>
          <p className="text-sm text-dm-text-secondary mb-2">{description}</p>
          <div className="flex items-center gap-2 text-xs text-dm-text-muted mb-2">
            <span className="font-mono">{file}</span>
            {line && <span>:{line}</span>}
          </div>
          {recommendation && (
            <div className="p-3 bg-dm-bg-surface rounded border border-dm-bg-border">
              <span className="font-medium text-dm-text-secondary">Recommendation:</span>
              <p className="text-sm text-dm-text-primary mt-1">{recommendation}</p>
            </div>
          )}
        </div>
        {onView && (
          <Button variant="ghost" size="sm" onClick={onView} className="flex-shrink-0">
            View
          </Button>
)}
      </div>
    </Panel>
  );
}