import type { ObjectionBlock } from "../_data/chapters";
import { Zap } from "lucide-react";

interface ObjectionCardProps {
  objections: ObjectionBlock[];
}

export function ObjectionCard({ objections }: ObjectionCardProps) {
  return (
    <div className="space-y-4">
      {objections.map((obj, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 overflow-hidden shadow-sm"
        >
          {/* Objection Header */}
          <div className="bg-red-50 border-b border-red-100 px-4 py-3">
            <div className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5 shrink-0 text-base">❌</span>
              <div>
                <p className="text-sm font-bold text-red-800">
                  {obj.objection}
                </p>
                {obj.context && (
                  <p className="text-xs text-red-600 mt-0.5 italic">
                    {obj.context}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Counter */}
          <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-3">
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">
                  Tumhara Counter:
                </p>
                <p className="text-sm font-medium text-emerald-900 leading-relaxed">
                  {obj.counter}
                </p>
              </div>
            </div>
          </div>

          {/* Follow-up if any */}
          {obj.followUp && (
            <div className="bg-blue-50 px-4 py-3">
              <div className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5 shrink-0">💡</span>
                <p className="text-xs text-blue-800 leading-relaxed">
                  {obj.followUp}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
