import { db } from "@/db";
import { appointments, clinics, reviews } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ReviewForm } from "./review-form";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit Review",
  description: "Share your experience about your recent consultation.",
};

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;

  // UUID validation
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(appointmentId)) {
    notFound();
  }

  // Fetch appointment and clinic
  const [appointment] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, appointmentId))
    .limit(1);

  if (!appointment) {
    notFound();
  }

  const [clinic] = await db
    .select()
    .from(clinics)
    .where(eq(clinics.id, appointment.clinicId))
    .limit(1);

  // Check if already reviewed
  const [existingReview] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.appointmentId, appointmentId))
    .limit(1);

  const themeColor = clinic?.themeColor || "#0ea5e9";
  const doctorName = clinic?.doctorName?.trim().startsWith("Dr.") 
    ? clinic.doctorName 
    : `Dr. ${clinic?.doctorName || ""}`;

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col">
      {/* Header Accent */}
      <div className="h-1.5 w-full" style={{ backgroundColor: themeColor }} />

      <main className="flex-1 w-full max-w-lg mx-auto px-5 py-12 flex flex-col">
        {/* Clinic Identity */}
        <div className="text-center mb-10">
          <div 
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-black shadow-md mb-4 overflow-hidden"
            style={{ backgroundColor: themeColor }}
          >
            {clinic?.logoUrl && clinic.logoUrl.match(/\.(png|jpg|jpeg|webp|gif|svg|avif)(\?.*)?$/i) ? (
              <img src={clinic.logoUrl} alt={clinic.name} className="w-full h-full object-cover" />
            ) : (
              clinic?.name?.[0]?.toUpperCase() || "C"
            )}
          </div>
          <h1 className="text-xl font-black text-slate-900 leading-tight">
            {clinic?.name || "Clinic"}
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">{doctorName}</p>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-6 sm:p-8 relative overflow-hidden">
          {/* Verified Badge */}
          <div className="absolute top-0 right-0 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-bl-xl flex items-center gap-1 border-b border-l border-emerald-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Visit
          </div>

          <h2 className="text-2xl font-black text-slate-800 mb-2 mt-2">
            Hi {appointment.patientName.split(" ")[0]},
          </h2>

          {existingReview ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-500 mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Review Submitted</h3>
              <p className="text-slate-500 text-sm">
                Thank you for your feedback! Your review helps other patients.
              </p>
            </div>
          ) : appointment.status !== "completed" ? (
            <div className="py-6">
              <p className="text-slate-500 text-sm">
                You can only submit a review after your consultation is marked as completed.
              </p>
            </div>
          ) : (
            <>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                How was your consultation with {doctorName}? Your feedback is greatly appreciated.
              </p>
              
              <ReviewForm appointmentId={appointmentId} themeColor={themeColor} />
            </>
          )}
        </div>
        
        <p className="text-center text-xs font-semibold text-slate-400 mt-10">
          Powered by Clinic Diary
        </p>
      </main>
    </div>
  );
}
