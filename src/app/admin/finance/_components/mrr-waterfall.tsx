"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Zap, RefreshCw } from "lucide-react";

interface MrrWaterfallProps {
  mrr: number;
  newMrr: number;
  expansionMrr: number;
  churnedMrr: number;
}

export function MrrWaterfall({ mrr, newMrr, expansionMrr, churnedMrr }: MrrWaterfallProps) {
  const netNewMrr = newMrr + expansionMrr - churnedMrr;

  return (
    <Card className="shadow-sm border-slate-200/80">
      <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <CardTitle className="text-base font-bold text-slate-900">
              MRR Movement Waterfall
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500 mt-1">
            Monthly recurring revenue expansion vs. contraction
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              New MRR
            </div>
            <p className="text-lg font-black text-slate-900 mt-1">
              +₹{newMrr.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">From new signups</p>
          </div>

          <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
            <div className="flex items-center gap-1 text-indigo-700 text-xs font-semibold">
              <RefreshCw className="w-3.5 h-3.5" />
              Expansion
            </div>
            <p className="text-lg font-black text-slate-900 mt-1">
              +₹{expansionMrr.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Plan upgrades</p>
          </div>

          <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-100">
            <div className="flex items-center gap-1 text-rose-700 text-xs font-semibold">
              <ArrowDownRight className="w-3.5 h-3.5" />
              Churned MRR
            </div>
            <p className="text-lg font-black text-slate-900 mt-1">
              -₹{churnedMrr.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Cancellations</p>
          </div>

          <div className="p-3 bg-slate-900 text-white rounded-lg shadow-xs">
            <div className="text-slate-300 text-xs font-semibold">
              Net New MRR
            </div>
            <p className="text-lg font-black text-emerald-400 mt-1">
              {netNewMrr >= 0 ? `+₹${netNewMrr.toLocaleString("en-IN")}` : `-₹${Math.abs(netNewMrr).toLocaleString("en-IN")}`}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Growth delta</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
