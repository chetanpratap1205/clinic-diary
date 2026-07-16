import { db } from "@/db";
import { doctorLeads, leadActivities, growthPartners } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  MapPin,
  Phone,
  Building2,
  User,
  Clock,
  ChevronLeft,
  MessageCircle,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { LogVisitForm } from "./log-visit-form";

export const metadata = {
  title: "Lead Details | Field Portal",
};

export default async function FieldPortalLeadDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const [partner] = await db
    .select({ id: growthPartners.id })
    .from(growthPartners)
    .where(eq(growthPartners.authUserId, authUser.userId))
    .limit(1);

  if (!partner) return null;

  const [lead] = await db
    .select()
    .from(doctorLeads)
    .where(eq(doctorLeads.id, params.id))
    .limit(1);

  if (!lead || lead.assignedTo !== partner.id) {
    notFound();
  }

  const activities = await db
    .select()
    .from(leadActivities)
    .where(eq(leadActivities.leadId, lead.id))
    .orderBy(desc(leadActivities.createdAt));

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-amber-100 text-amber-700",
    demo_scheduled: "bg-purple-100 text-purple-700",
    converted: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Dr. ${lead.doctorName},\n\nI'm from *Doctor Diary* — a clinic management app that helps doctors like you reduce no-shows and manage appointments easily.\n\nCould we schedule a quick 5-min demo? 😊`
  );
  const whatsappUrl = `https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`;

  return (
    <div className="p-4 md:p-8 space-y-5 max-w-3xl mx-auto w-full pb-48 md:pb-8">
      {/* Back */}
      <Link
        href="/field-portal/leads"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-2"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Leads
      </Link>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {lead.priority === "hot" && "🔥 "}
            {lead.clinicName || lead.doctorName}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {lead.specialty || "General"} ·{" "}
            {format(new Date(lead.createdAt), "MMM d, yyyy")}
          </p>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
            statusColors[lead.status] || "bg-slate-100 text-slate-600"
          }`}
        >
          {lead.status.replace("_", " ")}
        </span>
      </div>

      {/* Contact Actions */}
      <div className="grid grid-cols-2 gap-3">
        <a
          href={`tel:${lead.phone}`}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
        >
          <Phone className="w-4 h-4" />
          Call Now
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white font-semibold py-3 rounded-xl text-sm transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
      </div>

      {/* Lead Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {lead.doctorName}
              </p>
              <p className="text-xs text-slate-500">Doctor</p>
            </div>
          </div>

          {lead.clinicName && (
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {lead.clinicName}
                </p>
                <p className="text-xs text-slate-500">Clinic</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {lead.phone}
              </p>
              <p className="text-xs text-slate-500">Mobile</p>
            </div>
          </div>

          {lead.email && (
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {lead.email}
                </p>
                <p className="text-xs text-slate-500">Email</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {lead.address || "Address not provided"}
              </p>
              <p className="text-xs text-slate-500">{lead.city || "City not provided"}</p>
            </div>
          </div>
        </div>

        {lead.notes && (
          <div className="px-5 py-4 bg-slate-50/70 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Notes
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">{lead.notes}</p>
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          Activity History ({activities.length})
        </h2>

        {activities.length === 0 ? (
          <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No activity logged yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map((activity) => {
              const typeIcon: Record<string, string> = {
                visit: "📍",
                call: "📞",
                note: "📝",
                whatsapp: "💬",
                status_change: "🔄",
              };
              return (
                <div
                  key={activity.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-sm shrink-0">
                    {typeIcon[activity.type] ?? "📋"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-slate-900 text-sm capitalize">
                        {activity.type.replace("_", " ")}
                        {activity.newStatus && activity.previousStatus !== activity.newStatus && (
                          <span className="text-xs text-slate-500 ml-2 font-normal">
                            {activity.previousStatus} → {activity.newStatus}
                          </span>
                        )}
                      </h3>
                      <time className="text-xs text-slate-400 shrink-0 ml-2">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                        })}
                      </time>
                    </div>
                    {activity.notes && (
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                        {activity.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Visit Form (sticky on mobile) */}
      <LogVisitForm leadId={lead.id} currentStatus={lead.status} />
    </div>
  );
}
