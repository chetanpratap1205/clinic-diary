import { db } from "@/db";
import { qrCodes, clinics, subscriptions } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { AdminQrClient } from "../../admin/qr/admin-qr-client";
import { requireEmployeeRole } from "@/lib/auth/rbac";

export const metadata = { title: "QR Code Manager | Doctor Diary Manager Tools" };
export const dynamic = "force-dynamic";

export default async function ManagerQrPage() {
  await requireEmployeeRole(["admin", "manager"]);
  try {
    // Fetch all codes with joined clinic + subscription data
    const codes = await db
      .select({
        id: qrCodes.id,
        code: qrCodes.code,
        clinicId: qrCodes.clinicId,
        assignedAt: qrCodes.assignedAt,
        printedAt: qrCodes.printedAt,
        notes: qrCodes.notes,
        usageType: qrCodes.usageType,
        createdAt: qrCodes.createdAt,
        clinicName: clinics.name,
        clinicSlug: clinics.slug,
        doctorName: clinics.doctorName,
        doctorSpecialty: clinics.specialty,
        clinicLogo: clinics.logoUrl,
        subStatus: subscriptions.status,
        subEnd: subscriptions.currentPeriodEnd,
        totalScans: sql<number>`COALESCE((SELECT COUNT(*)::int FROM qr_scans s WHERE s.qr_code_id = qr_codes.id), 0)`,
        qrAppts: sql<number>`COALESCE((SELECT COUNT(*)::int FROM appointments a WHERE a.clinic_id = qr_codes.clinic_id AND a.acquisition_source LIKE 'qr_%'), 0)`,
      })
      .from(qrCodes)
      .leftJoin(clinics, eq(qrCodes.clinicId, clinics.id))
      .leftJoin(subscriptions, eq(qrCodes.clinicId, subscriptions.clinicId))
      .orderBy(desc(qrCodes.createdAt));

    // Fetch all clinics for the assign dropdown
    const allClinics = await db
      .select({
        id: clinics.id,
        name: clinics.name,
        slug: clinics.slug,
        doctorName: clinics.doctorName,
        specialty: clinics.specialty,
      })
      .from(clinics)
      .orderBy(clinics.name);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://doctor.naturexpress.in";

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">QR Code Manager</h1>
            <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Manager Tools
            </span>
        </div>
        <AdminQrClient initialCodes={codes} allClinics={allClinics} baseUrl={baseUrl} />
      </div>
    );
  } catch (error) {
    console.error("Manager QR Page Error:", error);
    return (
      <div className="p-8 max-w-4xl mx-auto mt-12 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>⚠️</span> Database Connection Error
        </h2>
        <p className="mb-4">
          The server could not connect to your Supabase database.
        </p>
      </div>
    );
  }
}
