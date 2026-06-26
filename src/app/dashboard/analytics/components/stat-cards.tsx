"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
  themeColor?: string;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  themeColor = "#0ea5e9",
}: StatCardProps) {
  const isPositive = trend && trend.value >= 0;
  
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
          {title}
        </h3>
        <div 
          className="p-2 rounded-full bg-opacity-10" 
          style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
        >
          {icon}
        </div>
      </div>
      
      <div className="flex flex-col gap-1 mt-2">
        <div className="text-3xl font-bold">{value}</div>
        
        {(description || trend) && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {trend && (
              <span 
                className={cn(
                  "font-medium flex items-center",
                  isPositive ? "text-emerald-500" : "text-rose-500"
                )}
              >
                {isPositive ? "+" : ""}{trend.value}%
              </span>
            )}
            <span className="truncate">
              {trend ? trend.label : description}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export function StatCardsGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  );
}
