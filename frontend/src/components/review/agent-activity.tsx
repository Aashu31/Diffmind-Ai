"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, Circle } from "lucide-react";

interface AgentStepProps {
  label: string;
  status: "pending" | "active" | "completed" | "failed";
  description?: string;
}

export function AgentStep({ label, status, description }: AgentStepProps) {
  const statusConfig = {
    pending: { icon: Circle, color: "text-dm-text-dim", bg: "bg-dm-bg-border" },
    active: { icon: Loader2, color: "text-dm-accent-amber", bg: "bg-dm-accent-amber/20 animate-pulse-slow" },
    completed: { icon: CheckCircle2, color: "text-dm-success", bg: "bg-dm-success/20" },
    failed: { icon: Circle, color: "text-dm-critical", bg: "bg-dm-critical/20" },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 group">
      <div className="flex-shrink-0 mt-0.5 relative">
        <div className={cn("w-2 h-2 rounded-full border-2 transition-all duration-300", config.color, config.bg)}>
          {status === "active" && <Icon className="w-2 h-2 animate-spin" />}
          {status === "completed" && <Icon className="w-2 h-2" />}
        </div>
        <div className="absolute left-1/2 top-5 bottom-5 -translate-x-1/2 w-px bg-dm-bg-border" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-dm-text-primary">{label}</p>
        {description && <p className="text-xs text-dm-text-muted mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

interface AgentProgressProps {
  steps: Array<{ label: string; status: "pending" | "active" | "completed" | "failed"; description?: string }>;
  currentStep?: number;
}

export function AgentProgress({ steps, currentStep }: AgentProgressProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <AgentStep key={index} {...step} />
      ))}
    </div>
  );
}

interface ActivityItemProps {
  time: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
}

export function ActivityItem({ time, message, type = "info" }: ActivityItemProps) {
  const typeConfig = {
    info: { color: "text-dm-accent-amber", dot: "bg-dm-accent-amber" },
    success: { color: "text-dm-success", dot: "bg-dm-success" },
    warning: { color: "text-dm-warning", dot: "bg-dm-warning" },
    error: { color: "text-dm-critical", dot: "bg-dm-critical" },
  };

  const config = typeConfig[type];

  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-1.5">
        <div className={cn("w-2 h-2 rounded-full", config.dot)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-dm-text-secondary">{message}</p>
        <p className="text-xs text-dm-text-dim mt-0.5">{time}</p>
      </div>
    </div>
  );
}