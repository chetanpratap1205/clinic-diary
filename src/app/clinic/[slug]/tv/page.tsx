import { db } from "@/db";
import { clinics, appointments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getClinicTodayDate } from "@/lib/timezone";
import { notFound } from "next/navigation";
import { TVQueueDisplay } from "@/components/tv/tv-queue-display";

export const revalidate = 0; // Dynamic route for TV

export default async function ClinicTVPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [clinic] = await db
    .select()
    .from(clinics)
    .where(eq(clinics.slug, slug))
    .limit(1);

  if (!clinic) {
    notFound();
  }

  const today = getClinicTodayDate();
  const todayAppts = await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.clinicId, clinic.id),
        eq(appointments.appointmentDate, today)
      )
    )
    .orderBy(appointments.appointmentTime);

  return <TVQueueDisplay clinic={clinic} initialAppts={todayAppts} />;
}
