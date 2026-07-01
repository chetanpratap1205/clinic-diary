"use client";

import dynamic from "next/dynamic";

export const AnalyticsChartsDynamic = dynamic(
  () => import("./analytics-charts").then((mod) => mod.AnalyticsCharts),
  {
    loading: () => (
      <div className="h-[400px] rounded-xl border border-dashed flex items-center justify-center text-muted-foreground bg-slate-50/50">
        Loading charts...
      </div>
    ),
    ssr: false,
  }
);
