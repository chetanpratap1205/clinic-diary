import { db } from "@/db";
import { qrCodes, clinics, subscriptions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { AdminQrClient } from "./admin-qr-client";

export const metadata = { title: "QR Code Manager | ClinicDiary Admin" };
export const dynamic = "force-dynamic";

export default async function AdminQrPage() {
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
}
