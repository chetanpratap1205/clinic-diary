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
    <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm p-6 flex flex-col gap-2 transition-all hover:shadow-lg hover:-translate-y-1">
      {/* Subtle top-border glow */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 opacity-80" 
        style={{ backgroundColor: themeColor }}
      />
      
      <div className="flex items-center justify-between relative z-10">
        <h3 className="tracking-tight text-sm font-bold text-slate-500 uppercase">
          {title}
        </h3>
        <div 
          className="p-2.5 rounded-xl shadow-inner" 
          style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
        >
          {icon}
        </div>
      </div>
      
      <div className="flex flex-col gap-1 mt-3 relative z-10">
        <div className="text-4xl font-black tracking-tighter text-slate-900">{value}</div>
        
        {(description || trend) && (
          <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-1">
            {trend && (
              <span 
                className={cn(
                  "font-bold flex items-center px-1.5 py-0.5 rounded-md text-xs",
                  isPositive ? "text-emerald-700 bg-emerald-100" : "text-rose-700 bg-rose-100"
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
