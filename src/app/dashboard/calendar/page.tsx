import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { appointments, followUps, patients } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { CalendarClient, type CalendarEvent } from "./calendar-client";
import { FadeInUp } from "@/components/dashboard/dashboard-animations";

export default async function CalendarPage() {
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) redirect("/login");

  // Fetch all appointments for this clinic
  const allAppointments = await db
    .select()
    .from(appointments)
    .where(eq(appointments.clinicId, authUser.clinicId))
    .orderBy(appointments.appointmentTime);

  // Fetch pending follow-ups
  const pendingFollowUps = await db
    .select({
      id: followUps.id,
      patientId: followUps.patientId,
      dueDate: followUps.dueDate,
      status: followUps.status,
      notes: followUps.notes,
      isFree: followUps.isFree,
      feeOverride: followUps.feeOverride,
      followUpAppointmentId: followUps.followUpAppointmentId,
      linkedApptTime: appointments.appointmentTime,
      linkedApptDate: appointments.appointmentDate,
      patient: {
        name: patients.name,
        phone: patients.phone,
      }
    })
    .from(followUps)
    .innerJoin(patients, eq(followUps.patientId, patients.id))
    .leftJoin(appointments, eq(followUps.followUpAppointmentId, appointments.id))
    .where(
      and(
        eq(followUps.clinicId, authUser.clinicId),
        eq(followUps.status, "pending")
      )
    );

  // Map to unified CalendarEvent array
  const events: CalendarEvent[] = [
    ...allAppointments.map(appt => ({
      type: "appointment" as const,
      id: appt.id,
      patientId: appt.patientId || "",
      patientName: appt.patientName,
      patientPhone: appt.patientPhone,
      date: appt.appointmentDate as string,
      time: appt.appointmentTime as string,
      status: appt.status,
      notes: appt.notes,
      acquisitionSource: appt.acquisitionSource,
    })),
    ...pendingFollowUps.map(fu => ({
      type: "follow_up" as const,
      id: fu.id,
      patientId: fu.patientId,
      patientName: fu.patient.name,
      patientPhone: fu.patient.phone,
      date: (fu.followUpAppointmentId && fu.linkedApptDate) ? (fu.linkedApptDate as string) : (fu.dueDate as string),
      time: (fu.followUpAppointmentId && fu.linkedApptTime) ? (fu.linkedApptTime as string) : "00:00:00",
      status: fu.followUpAppointmentId ? "follow_up_booked" : "pending_follow_up",
      notes: fu.notes,
      isFollowUpFree: fu.isFree,
      followUpAppointmentId: fu.followUpAppointmentId,
    }))
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <FadeInUp className="mb-5 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Clinic Calendar</h1>
        <p className="text-slate-500 mt-1 sm:mt-1.5 text-sm sm:text-base">Manage your entire schedule and upcoming bookings.</p>
      </FadeInUp>

      <CalendarClient events={events} />
    </div>
  );
}
