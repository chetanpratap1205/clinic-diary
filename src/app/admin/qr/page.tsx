import { db } from "@/db";
import { qrCodes, clinics, subscriptions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { AdminQrClient } from "./admin-qr-client";

export const metadata = { title: "QR Code Manager | ClinicDiary Admin" };
export const dynamic = "force-dynamic";

export default async function AdminQrPage() {
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
        createdAt: qrCodes.createdAt,
        clinicName: clinics.name,
        clinicSlug: clinics.slug,
        doctorName: clinics.doctorName,
        subStatus: subscriptions.status,
        subEnd: subscriptions.currentPeriodEnd,
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
      })
      .from(clinics)
      .orderBy(clinics.name);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://doctor.naturexpress.in";

    return <AdminQrClient initialCodes={codes} allClinics={allClinics} baseUrl={baseUrl} />;
  } catch (error) {
    console.error("Admin QR Page Error:", error);
    return (
      <div className="p-8 max-w-4xl mx-auto mt-12 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>⚠️</span> Database Connection Error
        </h2>
        <p className="mb-4">
          The server could not connect to your Supabase database. This usually happens if the live server is hitting connection limits, or the <code>DATABASE_URL</code> is missing or blocked.
        </p>
        <pre className="p-4 bg-white/60 rounded-xl overflow-auto text-sm border border-rose-100">
          {error instanceof Error ? error.stack || error.message : String(error)}
        </pre>
      </div>
    );
  }
}
