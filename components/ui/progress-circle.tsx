"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  steps?: number;
  className?: string;
}

function getScoreColor(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.8) return "bg-emerald-500";
  if (pct >= 0.6) return "bg-green-500";
  if (pct >= 0.5) return "bg-amber-500";
  return "bg-red-500";
}

export function ProgressCircle({
  value,
  max = 10,
  steps = 10,
  className,
}: ProgressBarProps) {
  const pct = Math.min(1, Math.max(0, value / max));
  const stepsFilled = Math.min(steps, Math.round(pct * steps));
  const percentLabel = Math.round(pct * 100);

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div className="flex flex-1 min-w-0 gap-0.5">
        {Array.from({ length: steps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 flex-1 min-w-1 rounded-none transition-colors",
              i < stepsFilled ? getScoreColor(value, max) : "bg-muted"
            )}
          />
        ))}
      </div>
      <span className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
        {percentLabel}%
      </span>
    </div>
  );
}
