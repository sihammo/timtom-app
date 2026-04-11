import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "destructive" | "outline" | "secondary";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-primary text-primary-foreground shadow",
    success: "bg-success text-success-foreground shadow",
    warning: "bg-warning text-warning-foreground shadow",
    destructive: "bg-destructive text-destructive-foreground shadow",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "text-foreground border border-border"
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-sans",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
