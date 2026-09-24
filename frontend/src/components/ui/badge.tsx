"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "amber" | "success" | "critical" | "warning" | "neutral";
  size?: "default" | "sm" | "xs";
  dot?: boolean;
}

function Badge({ className, variant = "default", size = "default", dot, children, ...props }: BadgeProps) {
  const variants = {
    default: "border-dm-bg-border-strong bg-dm-bg-raised text-dm-text-secondary",
    secondary: "border-dm-bg-border bg-dm-bg-raised text-dm-text-secondary",
    destructive: "border-dm-critical/30 bg-dm-critical/15 text-dm-critical",
    outline: "border-dm-bg-border-strong text-dm-text-secondary",
    amber: "border-dm-accent-amber/30 bg-dm-accent-amber/15 text-dm-accent-amber",
    success: "border-dm-success/30 bg-dm-success/15 text-dm-success",
    critical: "border-dm-critical/30 bg-dm-critical/15 text-dm-critical",
    warning: "border-dm-warning/30 bg-dm-warning/15 text-dm-warning",
    neutral: "border-dm-neutral/30 bg-dm-neutral/15 text-dm-neutral",
  };

  const sizes = {
    default: "px-2.5 py-0.5 text-xs",
    sm: "px-2 py-0 text-[10px]",
    xs: "px-1.5 py-0 text-[9px]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded font-medium transition-all duration-200",
        "border",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dot === true ? "bg-current" : dot)} />}
      {children}
    </div>
  );
}

export { Badge };