"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "amber";
  size?: "default" | "sm" | "lg" | "icon" | "xs";
  loading?: boolean;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", loading, asChild = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button";
    
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dm-focus focus-visible:ring-offset-2 focus-visible:ring-offset-dm-bg-deep disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

    const variants = {
      default: "bg-dm-text-primary text-dm-bg-deep hover:bg-dm-text-primary/90 shadow-sm shadow-dm-accent-amber/10",
      destructive: "bg-dm-critical text-dm-text-primary hover:bg-dm-critical/90 shadow-sm shadow-dm-critical/10",
      outline: "border border-dm-bg-border-strong bg-transparent hover:bg-dm-bg-raised hover:text-dm-text-primary",
      secondary: "bg-dm-bg-raised text-dm-text-primary hover:bg-dm-bg-elevated border border-dm-bg-border",
      ghost: "hover:bg-dm-bg-raised hover:text-dm-text-primary",
      link: "text-dm-accent-amber underline-offset-4 hover:underline",
      amber: "bg-dm-accent-amber text-dm-bg-deep hover:bg-dm-accent-amber-bright shadow-sm shadow-dm-accent-amber/20",
    };

    const sizes = {
      default: "h-10 px-4 py-2 gap-2",
      sm: "h-9 rounded-md px-3 gap-1.5",
      lg: "h-11 rounded-md px-8 gap-2",
      xl: "h-12 rounded-lg px-10 gap-2.5 text-base",
      icon: "h-10 w-10",
      xs: "h-8 px-2.5 text-xs gap-1",
    };

    return (
      <Comp
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button };