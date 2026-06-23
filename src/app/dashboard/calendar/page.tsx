import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { CalendarClient } from "./calendar-client";
import { FadeInUp } from "@/components/dashboard/dashboard-animations";

export default async function CalendarPage() {
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) redirect("/login");

  // Fetch all appointments for this clinic
  // For production with massive datasets, you'd fetch a date range (e.g., current month +/- 1 month)
  // For now, fetching all is fine for the MVP calendar rendering.
  const allAppointments = await db
    .select()
    .from(appointments)
    .where(eq(appointments.clinicId, authUser.clinicId))
    .orderBy(appointments.appointmentTime);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <FadeInUp className="mb-5 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Clinic Calendar</h1>
        <p className="text-slate-500 mt-1 sm:mt-1.5 text-sm sm:text-base">Manage your entire schedule and upcoming bookings.</p>
      </FadeInUp>

      <CalendarClient appointments={allAppointments} />
    </div>
  );
}
