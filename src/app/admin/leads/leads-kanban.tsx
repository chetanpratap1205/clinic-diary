"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ExternalLink, Sparkles, GripVertical, Copy } from "lucide-react";
import { generateLeadDemoUrl } from "./message-builder";
import { toast } from "sonner";

interface LeadsKanbanProps {
  leads: any[];
  onOpenMessageDrawer: (lead: any) => void;
  onOpenConvertModal: (lead: any) => void;
  onStatusChange: (lead: any, newStatus: string) => void;
}

const STAGES = [
  {
    id: "new",
    label: "New Leads",
    headerColor: "border-sky-300 bg-sky-600 text-white",
    columnColor: "bg-sky-50/50 border-sky-200",
    dropHighlight: "ring-2 ring-sky-400 bg-sky-100/60",
  },
  {
    id: "contacted",
    label: "Contacted",
    headerColor: "border-amber-300 bg-amber-500 text-white",
    columnColor: "bg-amber-50/50 border-amber-200",
    dropHighlight: "ring-2 ring-amber-400 bg-amber-100/60",
  },
  {
    id: "demo_scheduled",
    label: "Demo Scheduled",
    headerColor: "border-indigo-300 bg-indigo-600 text-white",
    columnColor: "bg-indigo-50/50 border-indigo-200",
    dropHighlight: "ring-2 ring-indigo-400 bg-indigo-100/60",
  },
  {
    id: "converted",
    label: "Converted ✓",
    headerColor: "border-emerald-300 bg-emerald-600 text-white",
    columnColor: "bg-emerald-50/50 border-emerald-200",
    dropHighlight: "ring-2 ring-emerald-400 bg-emerald-100/60",
  },
];

const PRIORITY_COLORS: Record<string, string> = {
  hot: "bg-red-100 text-red-700 border-red-200",
  warm: "bg-amber-100 text-amber-700 border-amber-200",
  normal: "bg-slate-100 text-slate-600 border-slate-200",
  cold: "bg-sky-100 text-sky-600 border-sky-200",
};

export function LeadsKanban({
  leads,
  onOpenMessageDrawer,
  onOpenConvertModal,
  onStatusChange,
}: LeadsKanbanProps) {
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, lead: any) => {
    setDraggingLeadId(lead.id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("leadId", lead.id);
    e.dataTransfer.setData("currentStatus", lead.status);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stageId);
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    const currentStatus = e.dataTransfer.getData("currentStatus");

    if (currentStatus === stageId) {
      setDraggingLeadId(null);
      setDragOverStage(null);
      return;
    }

    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    onStatusChange(lead, stageId);
    setDraggingLeadId(null);
    setDragOverStage(null);
    toast.success(`Moved Dr. ${lead.doctorName.split(" ").pop()} → ${STAGES.find((s) => s.id === stageId)?.label}`);
  };

  const handleDragEnd = () => {
    setDraggingLeadId(null);
    setDragOverStage(null);
  };

  const copyDemoUrl = (lead: any) => {
    const url = generateLeadDemoUrl(lead);
    navigator.clipboard.writeText(url);
    toast.success("Demo URL copied! 🔗");
  };

  return (
    <div>
      <p className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
        <GripVertical className="w-3.5 h-3.5" />
        Drag cards between columns to change status
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.status === stage.id);
          const isDragTarget = dragOverStage === stage.id;

          return (
            <div
              key={stage.id}
              className="flex flex-col space-y-2"
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDrop={(e) => handleDrop(e, stage.id)}
              onDragLeave={() => setDragOverStage(null)}
            >
              {/* Column Header */}
              <div className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-between ${stage.headerColor}`}>
                <span>{stage.label}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/25 text-white text-[11px] font-extrabold">
                  {stageLeads.length}
                </span>
              </div>

              {/* Drop Zone */}
              <div
                className={`flex-1 min-h-[320px] rounded-xl border-2 border-dashed transition-all p-2 space-y-2 ${
                  isDragTarget
                    ? stage.dropHighlight
                    : `${stage.columnColor} border-transparent`
                }`}
              >
                {stageLeads.length === 0 && !isDragTarget && (
                  <div className="p-4 text-center text-xs text-slate-400 h-full flex items-center justify-center">
                    Drop here to move to {stage.label}
                  </div>
                )}
                {isDragTarget && stageLeads.length === 0 && (
                  <div className="p-4 text-center text-xs font-semibold text-slate-600 h-full flex items-center justify-center">
                    ↓ Drop to move here
                  </div>
                )}

                {stageLeads.map((lead) => {
                  const demoUrl = generateLeadDemoUrl(lead);
                  const isDragging = draggingLeadId === lead.id;

                  return (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white rounded-xl border border-slate-200 p-3 shadow-xs hover:shadow-sm transition-all cursor-grab active:cursor-grabbing select-none ${
                        isDragging ? "opacity-40 scale-95 ring-1 ring-teal-400" : ""
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start gap-2 mb-2">
                        <GripVertical className="w-3.5 h-3.5 text-slate-300 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-bold text-xs text-slate-900 truncate">
                              {lead.doctorName}
                            </h4>
                            <Badge
                              variant="outline"
                              className={`text-[9px] font-bold flex-shrink-0 ${PRIORITY_COLORS[lead.priority || "normal"]}`}
                            >
                              {lead.priority?.toUpperCase() || "NORMAL"}
                            </Badge>
                          </div>
                          {lead.clinicName && (
                            <p className="text-[10px] font-medium text-slate-600 truncate mt-0.5">
                              {lead.clinicName}
                            </p>
                          )}
                          <p className="text-[10px] text-slate-400 truncate">
                            {lead.specialty}
                            {lead.city ? ` • ${lead.city}` : ""}
                          </p>
                        </div>
                      </div>

                      {/* Step progress bar */}
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3].map((s) => (
                          <div
                            key={s}
                            className={`flex-1 h-1 rounded-full ${
                              s <= (lead.messageSentStep || 0) ? "bg-emerald-400" : "bg-slate-100"
                            }`}
                          />
                        ))}
                        <span className="text-[9px] text-slate-400 ml-1 whitespace-nowrap">
                          {lead.messageSentStep || 0}/3
                        </span>
                      </div>

                      {/* Live Demo Link */}
                      <div className="flex gap-1.5 mb-2">
                        <button
                          onClick={() => copyDemoUrl(lead)}
                          className="flex-1 flex items-center justify-between text-[10px] bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold p-1.5 rounded-md border border-teal-200/60 transition-colors"
                          title="Copy personalised demo URL"
                        >
                          <span className="truncate">Copy Demo URL</span>
                          <Copy className="w-2.5 h-2.5 shrink-0 ml-1" />
                        </button>
                        <a
                          href={demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-md border border-sky-200/60 transition-colors"
                          title="Open live demo"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 pt-1.5 border-t border-slate-100">
                        {lead.status !== "converted" && (
                          <button
                            onClick={() => onOpenConvertModal(lead)}
                            className="flex-1 px-1.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            Convert
                          </button>
                        )}
                        <button
                          onClick={() => onOpenMessageDrawer(lead)}
                          className="flex-1 px-1.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1"
                        >
                          <MessageSquare className="w-2.5 h-2.5" />
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
