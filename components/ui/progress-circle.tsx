"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressCircleProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function getScoreColor(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.8) return "stroke-emerald-500";
  if (pct >= 0.6) return "stroke-green-500";
  if (pct >= 0.5) return "stroke-amber-500";
  return "stroke-red-500";
}

export function ProgressCircle({
  value,
  max = 10,
  size = 32,
  strokeWidth = 3,
  className,
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, Math.max(0, value / max));
  const strokeDashoffset = circumference - circumference * pct;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn("transition-all duration-300", getScoreColor(value, max))}
        />
      </svg>
      <span className="absolute text-xs font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}
