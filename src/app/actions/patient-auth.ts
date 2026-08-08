"use server";

import { db } from "@/db";
import { appointments } from "@/db/schema";
import { eq, or } from "drizzle-orm";


/**
 * Cancel patient appointment via token.
 */
export async function cancelPatientAppointment(cancelToken: string) {
  try {
    if (!cancelToken) return { error: "Invalid cancellation token." };

    const [appt] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.cancelToken, cancelToken))
      .limit(1);

    if (!appt) {
      return { error: "Appointment not found or already cancelled." };
    }

    if (appt.status === "cancelled") {
      return { message: "This appointment was already cancelled." };
    }

    await db
      .update(appointments)
      .set({ status: "cancelled" })
      .where(eq(appointments.id, appt.id));

    return { success: true, message: "Your appointment has been successfully cancelled." };
  } catch (error) {
    console.error("cancelPatientAppointment failed:", error);
    return { error: "Failed to cancel appointment. Please contact the clinic." };
  }
}
