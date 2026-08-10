"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Phone, ExternalLink, MessageSquare, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDoctorName } from "@/lib/utils";

export interface InactiveClinic {
  id: string;
  name: string;
  doctorName: string;
  specialty: string;
  phone: string;
  createdAt: string | Date;
}

interface NeedsAttentionWidgetProps {
  inactiveClinics: InactiveClinic[];
}

export function NeedsAttentionWidget({ inactiveClinics }: NeedsAttentionWidgetProps) {
  return (
    <Card className="border-rose-100 bg-gradient-to-b from-white to-rose-50/20 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-rose-100/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-100/80 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Needs Attention
            </CardTitle>
            <p className="text-xs text-slate-500">
              Operational items requiring admin intervention
            </p>
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
          {inactiveClinics.length} Issue{inactiveClinics.length === 1 ? "" : "s"}
        </span>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {inactiveClinics.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-800">All Clinics Active & Healthy!</p>
            <p className="text-xs text-slate-500">No clinics without appointments in the last 7 days.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              Inactive Clinics (No Appointments in 7 Days)
            </div>

            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200/80 bg-white overflow-hidden">
              {inactiveClinics.map((clinic) => {
                const formattedPhone = clinic.phone?.replace(/\D/g, "") || "";
                const waUrl = formattedPhone ? `https://wa.me/91${formattedPhone.slice(-10)}?text=${encodeURIComponent(`Hello ${formatDoctorName(clinic.doctorName)}, we noticed your clinic (${clinic.name}) on Doctor Diary hasn't booked appointments recently. Need help setting up?`)}` : "#";

                return (
                  <div key={clinic.id} className="p-3 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 truncate">
                          {clinic.name}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium shrink-0">
                          {clinic.specialty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDoctorName(clinic.doctorName)} • {clinic.phone}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {formattedPhone && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200/60 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          WhatsApp
                        </a>
                      )}
                      <Link href={`/admin/clinics?search=${encodeURIComponent(clinic.name)}`}>
                        <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs gap-1">
                          View <ExternalLink className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
