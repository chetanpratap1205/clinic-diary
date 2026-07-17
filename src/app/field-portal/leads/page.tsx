import { db } from "@/db";
import { doctorLeads, growthPartners } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import Link from "next/link";
import { MapPin, Phone, Building2, PlusCircle, Filter } from "lucide-react";
import { format } from "date-fns";

export const metadata = {
  title: "My Leads | Field Portal",
};

export default async function FieldPortalLeadsPage() {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const [partner] = await db
    .select({ id: growthPartners.id })
    .from(growthPartners)
    .where(eq(growthPartners.authUserId, authUser.userId))
    .limit(1);

  if (!partner) return null;

  const leads = await db
    .select()
    .from(doctorLeads)
    .where(eq(doctorLeads.assignedTo, partner.id))
    .orderBy(
      // Hot first, then by status priority, then date
      sql`case ${doctorLeads.priority} when 'hot' then 1 when 'warm' then 2 when 'normal' then 3 when 'cold' then 4 else 5 end`,
      desc(doctorLeads.createdAt)
    );

  const statusColors: Record<string, { bg: string; text: string }> = {
    new: { bg: "bg-blue-100", text: "text-blue-700" },
    contacted: { bg: "bg-amber-100", text: "text-amber-700" },
    demo_scheduled: { bg: "bg-purple-100", text: "text-purple-700" },
    converted: { bg: "bg-emerald-100", text: "text-emerald-700" },
    rejected: { bg: "bg-red-100", text: "text-red-700" },
  };

  const priorityIcon: Record<string, string> = {
    hot: "🔥",
    warm: "🌡️",
    normal: "📋",
    cold: "❄️",
  };

  return (
    <div className="p-4 md:p-8 space-y-5 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Leads
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {leads.length} leads · {leads.filter((l) => l.priority === "hot").length} 🔥 hot
          </p>
        </div>
        <Link
          href="/field-portal/leads/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Lead
        </Link>
      </header>

      <div className="grid gap-3">
        {leads.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center shadow-sm">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">No leads assigned yet</p>
            <p className="text-slate-400 text-sm mt-1 mb-5">
              Your admin will assign leads or you can add new ones.
            </p>
            <Link
              href="/field-portal/leads/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
            >
              <PlusCircle className="w-4 h-4" />
              Add New Lead
            </Link>
          </div>
        ) : (
          leads.map((lead) => {
            const sc = statusColors[lead.status] || { bg: "bg-slate-100", text: "text-slate-600" };
            const icon = priorityIcon[lead.priority] ?? "📋";
            return (
              <Link key={lead.id} href={`/field-portal/leads/${lead.id}`}>
                <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 active:scale-[0.99] animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="font-bold text-slate-900 text-base">
                        {icon} {lead.clinicName || lead.doctorName}
                      </h2>
                      {lead.doctorName && lead.clinicName && (
                        <p className="text-xs text-slate-500 mt-0.5">Dr. {lead.doctorName}</p>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${sc.bg} ${sc.text}`}
                    >
                      {lead.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="space-y-1.5 mt-3">
                    <div className="flex items-center text-xs text-slate-500 gap-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {lead.address || lead.city || "No address"}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500 gap-2">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{lead.phone}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
