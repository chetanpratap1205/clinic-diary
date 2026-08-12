"use client";

import { useState } from "react";
import { LeadsClient } from "./leads-client";
import { TeamView } from "./team-view";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Users, ListChecks } from "lucide-react";

export function LeadsPageWrapper({
  leads,
  stats,
  cities,
  total,
  totalPages,
  currentPage,
  currentFilters,
  isAdmin,
  teamData,
}: any) {
  const [activeTab, setActiveTab] = useState<"pipeline" | "team">("pipeline");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleViewLeads = (employeeId: string) => {
    setActiveTab("pipeline");
    const params = new URLSearchParams(searchParams.toString());
    params.set("assignedEmployeeId", employeeId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Doctor Leads
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            Manage your sales pipeline and send WhatsApp messages from the playbook.
          </p>
        </div>
        
        {isAdmin && (
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                activeTab === "pipeline" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <ListChecks className="w-4 h-4" />
              Pipeline
            </button>
            <button
              onClick={() => setActiveTab("team")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                activeTab === "team" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Users className="w-4 h-4" />
              Team View
            </button>
          </div>
        )}
      </div>

      {activeTab === "pipeline" ? (
        <LeadsClient
          leads={leads}
          stats={stats}
          cities={cities}
          total={total}
          totalPages={totalPages}
          currentPage={currentPage}
          currentFilters={currentFilters}
          isAdmin={isAdmin}
        />
      ) : (
        <TeamView 
          teamData={teamData} 
          onViewLeads={handleViewLeads}
        />
      )}
    </div>
  );
}
