import { db } from "@/db";
import { availability, availabilityOverrides, appointments } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { format, parse, addMinutes } from "date-fns";

export interface TimeSlot {
  time: string; // "HH:MM"
  displayTime: string; // "10:30 AM"
  available: boolean;
}

export async function getAvailableSlotsForDate(
  clinicId: string,
  dateStr: string // "YYYY-MM-DD"
): Promise<TimeSlot[]> {
  const date = parse(dateStr, "yyyy-MM-dd", new Date());
  const dayOfWeek = date.getDay(); // 0=Sun

  // Check for override (holiday/closed)
  const overrides = await db
    .select()
    .from(availabilityOverrides)
    .where(
      and(
        eq(availabilityOverrides.clinicId, clinicId),
        eq(availabilityOverrides.date, dateStr)
      )
    );

  if (overrides.length > 0 && overrides[0].isClosed) {
    return [];
  }

  // Get clinic availability for this day
  const dayAvailability = await db
    .select()
    .from(availability)
    .where(
      and(
        eq(availability.clinicId, clinicId),
        eq(availability.dayOfWeek, dayOfWeek)
      )
    );

  if (!dayAvailability.length) {
    return [];
  }

  const avail = dayAvailability[0];
  const slotDuration = avail.slotDurationMinutes;

  // Get booked slots for this date
  const bookedSlots = await db
    .select({ appointmentTime: appointments.appointmentTime })
    .from(appointments)
    .where(
      and(
        eq(appointments.clinicId, clinicId),
        eq(appointments.appointmentDate, dateStr),
        // exclude cancelled
        ne(appointments.status, "cancelled")
      )
    );

  const bookedTimes = new Set(
    bookedSlots
      .filter((a) => a.appointmentTime)
      .map((a) => {
        const t = a.appointmentTime as string;
        return t.slice(0, 5); // "HH:MM"
      })
  );

  // Generate all slots
  const slots: TimeSlot[] = [];
  const [startH, startM] = avail.startTime.split(":").map(Number);
  const [endH, endM] = avail.endTime.split(":").map(Number);

  let current = new Date(date);
  current.setHours(startH, startM, 0, 0);

  const end = new Date(date);
  end.setHours(endH, endM, 0, 0);

  while (current < end) {
    const timeStr = format(current, "HH:mm");
    const displayTime = format(current, "hh:mm aa").replace("am", "AM").replace("pm", "PM");

    slots.push({
      time: timeStr,
      displayTime,
      available: !bookedTimes.has(timeStr),
    });

    current = addMinutes(current, slotDuration);
  }

  return slots;
}

export async function getClinicAvailableDays(clinicId: string): Promise<number[]> {
  const avail = await db
    .select({ dayOfWeek: availability.dayOfWeek })
    .from(availability)
    .where(eq(availability.clinicId, clinicId));

  return avail.map((a) => a.dayOfWeek);
}
