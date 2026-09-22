"use client";

import { useState, useEffect, useTransition } from "react";
import {
  X,
  Phone,
  MapPin,
  Building2,
  Tag,
  Clock,
  MessageCircle,
  Pencil,
  Trash2,
  CheckCircle2,
  Calendar,
  Activity,
  StickyNote,
  Sparkles,
  ExternalLink,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { DoctorLead } from "@/db/schema";
import { getMetaAdsSearchUrl, getInstagramSearchUrl } from "./whatsapp-message-drawer";
import {
  LEAD_STATUSES,
  VERIFICATION_STATUSES,
  CALL_OUTCOMES,
  generateLeadDemoUrl,
} from "./message-builder";
import { getLeadActivities, deleteLead, updateLead, logCallOutcome, updateVerificationStatus } from "./actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeadDetailDrawerProps {
  lead: DoctorLead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditLead?: (lead: DoctorLead) => void;
  onOpenWhatsAppDrawer?: (lead: DoctorLead) => void;
  onOpenConvertModal?: (lead: DoctorLead) => void;
  onRefresh?: () => void;
}

interface ActivityItem {
  id: string;
  type: string;
  notes: string | null;
  previousStatus: string | null;
  newStatus: string | null;
  createdAt: Date;
}

const activityIcons: Record<string, string> = {
  whatsapp: "💬",
  call: "📞",
  visit: "🏥",
  note: "📝",
  status_change: "🔄",
  verification_change: "🛡️",
};

export function LeadDetailDrawer({
  lead,
  open,
  onOpenChange,
  onEditLead,
  onOpenWhatsAppDrawer,
  onOpenConvertModal,
  onRefresh,
}: LeadDetailDrawerProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [notes, setNotes] = useState(lead?.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [showCallOutcomeModal, setShowCallOutcomeModal] = useState(false);
  const [callNotes, setCallNotes] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    setNotes(lead?.notes || "");
  }, [lead?.notes]);

  useEffect(() => {
    if (!open || !lead?.id) return;
    setLoadingActivities(true);
    getLeadActivities(lead.id)
      .then((data) => setActivities(data as ActivityItem[]))
      .finally(() => setLoadingActivities(false));
  }, [lead?.id, open]);

  const handleSaveNotes = async () => {
    if (!lead) return;
    setSavingNotes(true);
    const res = await updateLead(lead.id, { notes });
    setSavingNotes(false);
    if (res.error) toast.error(res.error);
    else toast.success("Notes saved");
  };

  const handleDelete = () => {
    if (!lead) return;
    if (!confirm(`Delete lead for ${lead.doctorName}? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteLead(lead.id);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Lead deleted");
        onOpenChange(false);
        onRefresh?.();
      }
    });
  };

  const handleStatusChange = (val: string) => {
    if (!lead) return;
    startTransition(async () => {
      const res = await updateLead(lead.id, { status: val });
      if (res.error) toast.error(res.error);
      else {
        toast.success("Status updated");
        onRefresh?.();
      }
    });
  };

  const handleVerificationChange = (val: string) => {
    if (!lead) return;
    startTransition(async () => {
      const res = await updateVerificationStatus(lead.id, val);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Verification status updated");
        onRefresh?.();
      }
    });
  };

  const handleLogCall = (outcome: string) => {
    if (!lead) return;
    startTransition(async () => {
      const res = await logCallOutcome(lead.id, outcome, callNotes || undefined);
      if (res.error) toast.error(res.error);
      else {
        toast.success(`Call logged: ${outcome}`);
        setShowCallOutcomeModal(false);
        setCallNotes("");
        onRefresh?.();
      }
    });
  };

  const copyDemoUrl = () => {
    if (!lead) return;
    const url = generateLeadDemoUrl(lead);
    navigator.clipboard.writeText(url);
    toast.success("Live Demo URL copied! 🔗");
  };

  if (!open || !lead) return null;

  const stepProgress = lead.messageSentStep || 0;
  const demoUrl = generateLeadDemoUrl(lead);
  const isConverted = lead.status === "converted";
  const verObj = VERIFICATION_STATUSES.find(v => v.value === (lead.verificationStatus || "needs_verification"));

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => onOpenChange(false)} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:max-w-lg bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4 shrink-0 bg-slate-50/50">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${verObj?.badgeColor || "bg-amber-50 text-amber-700 border-amber-200"}`}>
                {verObj?.label || "Needs Verification"}
              </span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Lead Details</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 truncate">{lead.doctorName}</h2>
            {lead.clinicName && (
              <p className="text-sm text-slate-500 mt-0.5 truncate">{lead.clinicName}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {onEditLead && (
              <button
                onClick={() => { onEditLead(lead); onOpenChange(false); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-colors"
                title="Edit Lead"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
              title="Delete Lead"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Quick Actions Toolbar */}
          <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center gap-2 flex-wrap bg-slate-50/60">
            {onOpenWhatsAppDrawer && !isConverted && (
              <button
                onClick={() => { onOpenWhatsAppDrawer(lead); onOpenChange(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5A] text-white text-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp Playbook
              </button>
            )}
            <a
              href={`tel:${lead.phone.replace(/[^\d+]/g, '')}`}
              onClick={() => setShowCallOutcomeModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
              title="Call directly from your mobile SIM or phone app"
            >
              <Phone className="w-3.5 h-3.5" />
              Call Mobile SIM
            </a>
            {onOpenConvertModal && !isConverted && (
              <button
                onClick={() => { onOpenConvertModal(lead); onOpenChange(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Convert to Clinic
              </button>
            )}
            <button
              onClick={copyDemoUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-semibold transition-colors"
              title="Copy personalised demo link"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Demo Link
            </button>
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Preview Demo
            </a>

            {/* 1-Click Verification Links */}
            <a
              href={getMetaAdsSearchUrl(lead.clinicName || lead.doctorName)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors"
            >
              📣 Meta Ads
            </a>
            <a
              href={getInstagramSearchUrl(lead.clinicName || lead.doctorName, lead.city)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs font-semibold transition-colors"
            >
              📸 Instagram
            </a>
          </div>

          {/* Quick Call Outcome Logging Section */}
          {showCallOutcomeModal && (
            <div className="mx-4 sm:mx-6 my-3 p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Log Call Outcome</p>
                <button onClick={() => setShowCallOutcomeModal(false)} className="text-indigo-400 hover:text-indigo-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-indigo-700">Select outcome after calling Dr. {lead.doctorName}:</p>
              <div className="flex flex-wrap gap-1.5">
                {CALL_OUTCOMES.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => handleLogCall(o.value)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-indigo-200 text-indigo-800 hover:bg-indigo-600 hover:text-white transition-all shadow-xs"
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Optional call note (e.g. Call back on Tuesday at 4 PM)..."
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-indigo-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Key Info Grid */}
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="grid grid-cols-2 gap-3">
              <InfoRow icon={Phone} label="Phone" value={lead.phone} />
              {lead.email && <InfoRow icon={Tag} label="Email" value={lead.email} />}
              {lead.specialty && <InfoRow icon={Tag} label="Specialty" value={lead.specialty} />}
              {lead.city && <InfoRow icon={MapPin} label="City" value={lead.city} />}
              <InfoRow
                icon={Clock}
                label="Last Contact"
                value={
                  lead.lastContactedAt
                    ? `${formatDistanceToNow(new Date(lead.lastContactedAt), { addSuffix: true })} (${lead.lastContactMethod || "unknown"})`
                    : "Never contacted"
                }
              />
              {lead.lastCallOutcome && (
                <InfoRow
                  icon={Phone}
                  label="Last Call Outcome"
                  value={CALL_OUTCOMES.find(o => o.value === lead.lastCallOutcome)?.label || lead.lastCallOutcome}
                />
              )}
              {lead.followUpDate && (
                <InfoRow
                  icon={Calendar}
                  label="Follow-up Due"
                  value={format(new Date(lead.followUpDate), "dd MMM yyyy")}
                />
              )}
              {lead.goLiveIntentAt && (
                <div className="col-span-2">
                  <InfoRow
                    icon={Sparkles}
                    label="Go Live Intent Expressed"
                    value={format(new Date(lead.goLiveIntentAt), "dd MMM yyyy, h:mm a")}
                  />
                </div>
              )}
              {lead.address && (
                <div className="col-span-2">
                  <InfoRow icon={Building2} label="Address" value={lead.address} />
                </div>
              )}
            </div>
          </div>

          {/* Status & Verification Controls */}
          <div className="px-6 py-4 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Pipeline & Verification Controls</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Lifecycle Status</p>
                <Select value={lead.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Verification Status</p>
                <Select value={lead.verificationStatus || "needs_verification"} onValueChange={handleVerificationChange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VERIFICATION_STATUSES.map((v) => (
                      <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Playbook Status */}
          <div className="px-6 py-4 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Message Playbook Progress</p>
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Universal Playbook</span>
              </div>
              {/* Step Progress */}
              <div>
                <p className="text-xs text-slate-500 mb-2">Steps sent:</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          s <= stepProgress
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        {s <= stepProgress ? "✓" : s}
                      </div>
                      {s < 3 && (
                        <div className={`w-6 h-0.5 ${s < stepProgress ? "bg-emerald-400" : "bg-slate-200"}`} />
                      )}
                    </div>
                  ))}
                  {stepProgress >= 3 ? (
                    <span className="text-xs text-emerald-600 font-medium ml-2">Sequence Complete</span>
                  ) : (
                    <span className="text-xs text-slate-400 ml-2">Step {stepProgress + 1} pending</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Activity Timeline</p>
            </div>
            {loadingActivities ? (
              <div className="text-sm text-slate-400 py-4 text-center">Loading...</div>
            ) : activities.length === 0 ? (
              <div className="text-sm text-slate-400 py-4 text-center bg-slate-50 rounded-xl">
                No activity logged yet.
                <br />
                <span className="text-xs">Activity is recorded when you send messages or change status.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((a) => (
                  <div key={a.id} className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-sm">
                      {activityIcons[a.type] || "📋"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700">
                        {a.type === "whatsapp" && "WhatsApp message sent"}
                        {a.type === "call" && "Phone call logged"}
                        {a.type === "visit" && "Clinic visit recorded"}
                        {a.type === "note" && "Note added"}
                        {a.type === "status_change" && (
                          <span>
                            Status: <span className="text-slate-500">{a.previousStatus}</span>
                            {" → "}
                            <span className="font-semibold text-slate-900">{a.newStatus}</span>
                          </span>
                        )}
                      </p>
                      {a.notes && <p className="text-xs text-slate-500 mt-0.5 truncate">{a.notes}</p>}
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Notes</p>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleSaveNotes}
              placeholder="Add notes about this doctor, their clinic setup, objections, follow-up context..."
              rows={5}
              className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none leading-relaxed"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-slate-400">Auto-saved on blur</p>
              <Button
                onClick={handleSaveNotes}
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                disabled={savingNotes}
              >
                {savingNotes ? "Saving..." : "Save Notes"}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 shrink-0">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Source: <span className="font-medium text-slate-600">{lead.source}</span></span>
            <span>Added: {format(new Date(lead.createdAt), "dd MMM yyyy")}</span>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-sm text-slate-700 font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
