"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  className?: string;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
}: ChartTooltipContentProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-popover p-3 text-popover-foreground shadow-md",
        className
      )}
    >
      {label && (
        <div className="mb-2 text-sm font-medium text-popover-foreground">
          {label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground">
                {entry.name || entry.dataKey}
              </span>
            </div>
            <span className="text-sm font-medium">
              {typeof entry.value === "number"
                ? entry.value.toLocaleString()
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
