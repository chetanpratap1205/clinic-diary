import { db } from "./src/db";
import { qrCodes, clinics, subscriptions } from "./src/db/schema";
import { eq, desc } from "drizzle-orm";

async function run() {
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
    
  console.log("Success:", codes.length);
}

run().catch(console.error);
