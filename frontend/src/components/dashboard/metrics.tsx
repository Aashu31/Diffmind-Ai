"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPIMetricProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  accent?: "amber" | "success" | "critical" | "neutral";
}

export function KPIMetric({ label, value, change, changeLabel, icon, trend = "neutral", accent = "amber" }: KPIMetricProps) {
  const accentColors = {
    amber: "text-dm-accent-amber",
    success: "text-dm-success",
    critical: "text-dm-critical",
    neutral: "text-dm-neutral",
  };

  const trendIcons = {
    up: <TrendingUp className="w-4 h-4 text-dm-success" />,
    down: <TrendingDown className="w-4 h-4 text-dm-critical" />,
    neutral: <Minus className="w-4 h-4 text-dm-text-muted" />,
  };

  return (
    <Panel padding="md" className="relative overflow-hidden">
      <div className="absolute top-3 right-3 opacity-5">
        {icon && <span className="text-4xl">{icon}</span>}
      </div>
      <div className="relative z-10">
        <p className="text-xs font-medium text-dm-text-muted uppercase tracking-wider mb-1">{label}</p>
        <p className="text-3xl font-bold text-dm-text-primary mb-1">{value}</p>
        {change !== undefined && (
          <div className="flex items-center gap-1.5">
            <span className={cn("text-sm font-medium", accentColors[accent])}>
              {trendIcons[trend]}
              {change >= 0 ? "+" : ""}{change}%
            </span>
            {changeLabel && <span className="text-xs text-dm-text-muted">{changeLabel}</span>}
          </div>
        )}
      </div>
      <div className="absolute bottom-3 right-3 w-20 h-6 opacity-10">
        <svg viewBox="0 0 80 20" preserveAspectRatio="none" className="w-full h-full">
          <path
            d="M0,10 Q20,5 40,10 T80,10"
            stroke={accent === "amber" ? "#D8A84E" : accent === "success" ? "#78B887" : accent === "critical" ? "#D85B4F" : "#8B8F89"}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </Panel>
  );
}

const accentColors = {
  amber: "text-dm-accent-amber",
  success: "text-dm-success",
  critical: "text-dm-critical",
  neutral: "text-dm-neutral",
};

interface StatBlockProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function StatBlock({ label, value, subtitle, icon }: StatBlockProps) {
  return (
    <Panel padding="md" className="text-center">
      {icon && <div className="text-2xl mb-2 opacity-70">{icon}</div>}
      <p className="text-3xl font-bold text-dm-text-primary mb-1">{value}</p>
      <p className="text-sm font-medium text-dm-text-muted uppercase tracking-wider">{label}</p>
      {subtitle && <p className="text-xs text-dm-text-dim mt-1">{subtitle}</p>}
    </Panel>
  );
}

interface MetricRowProps {
  label: string;
  value: string | number;
  rightElement?: React.ReactNode;
}

export function MetricRow({ label, value, rightElement }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-dm-bg-border/50 last:border-0">
      <span className="text-sm text-dm-text-secondary">{label}</span>
      <div className="flex items-center gap-3 text-right">
        <span className="font-mono text-sm font-medium text-dm-text-primary">{value}</span>
        {rightElement}
      </div>
    </div>
  );
}