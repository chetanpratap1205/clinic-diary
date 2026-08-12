"use client";

import { Users, TrendingUp, CheckCircle, Target, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamMemberData {
  id: string;
  name: string;
  role: string;
  territoryCities: string[];
  targetMonthlyLeads: number | null;
  targetMonthlyConversions: number | null;
  assigned: number;
  contacted: number;
  demos: number;
  converted: number;
  goLiveIntents: number;
}

export function TeamView({ 
  teamData, 
  onViewLeads 
}: { 
  teamData: TeamMemberData[];
  onViewLeads: (employeeId: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Team Pipeline Performance</h2>
          <p className="text-xs text-slate-500">
            Monitor area managers and field sales execution across territories.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" />
          <span className="text-sm font-bold text-slate-800">{teamData.length} Active Staff</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamData.map((member) => {
          const conversionTargetPct = member.targetMonthlyConversions
            ? Math.min(Math.round((member.converted / member.targetMonthlyConversions) * 100), 100)
            : 0;

          return (
            <div key={member.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    {member.name}
                    {member.goLiveIntents > 0 && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
                        <Rocket className="w-3 h-3" />
                        {member.goLiveIntents} Intents
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded">
                      {member.role.replace("_", " ")}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {member.territoryCities.length > 0 ? member.territoryCities.join(", ") : "All Regions"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pipeline</p>
                    <p className="text-lg font-black text-slate-800">{member.assigned}</p>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 text-center">
                    <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider">Converted</p>
                    <p className="text-lg font-black text-emerald-700">{member.converted}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-medium text-slate-500 px-1">
                  <span>Contacted: {member.contacted}</span>
                  <span>Demos: {member.demos}</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-teal-600" />
                      Monthly Target
                    </span>
                    <span className="font-bold text-slate-900">{conversionTargetPct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-teal-500 transition-all rounded-full" 
                      style={{ width: `${conversionTargetPct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 text-right">
                    {member.converted} / {member.targetMonthlyConversions} conversions
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100">
                <Button 
                  onClick={() => onViewLeads(member.id)}
                  variant="outline" 
                  className="w-full h-8 text-xs bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                >
                  View Pipeline →
                </Button>
              </div>
            </div>
          );
        })}

        {teamData.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-sm font-semibold text-slate-500">No active staff found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
