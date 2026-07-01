import { Appointment } from "@/db/schema";
import { format, differenceInMinutes, parse, isAfter } from "date-fns";

/**
 * Calculates how far behind schedule the clinic is running.
 * Based on the currently serving patient (or next waiting patient) vs their scheduled time.
 */
export function getClinicDelay(appointments: Appointment[], now: Date): number {
  const inConsultation = appointments
    .filter(a => a.status === "in_consultation")
    .sort((a, b) => new Date(a.consultationStartTime || 0).getTime() - new Date(b.consultationStartTime || 0).getTime());
    
  const currentlyServing = inConsultation.length > 0 ? inConsultation[0] : null;

  const waitingRoom = appointments
    .filter(a => a.status === "checked_in")
    .sort((a, b) => (a.tokenNumber || 0) - (b.tokenNumber || 0));

  let delayMinutes = 0;
  
  if (currentlyServing) {
    const scheduledTime = parse(currentlyServing.appointmentTime, 'HH:mm:ss', now);
    const diffMins = differenceInMinutes(now, scheduledTime);
    if (diffMins > 0) delayMinutes = diffMins;
  } else if (waitingRoom.length > 0) {
    const firstWaiting = waitingRoom[0];
    const scheduledTime = parse(firstWaiting.appointmentTime, 'HH:mm:ss', now);
    const diffMins = differenceInMinutes(now, scheduledTime);
    if (diffMins > 0) delayMinutes = diffMins;
  }
  
  return delayMinutes;
}

/**
 * Calculates the estimated start time for a given appointment, factoring in clinic delay.
 */
export function getEstimatedStart(
  appointment: Appointment,
  delayMinutes: number,
  now: Date
): {
  estimatedStart: Date;
  isDelayed: boolean;
  waitMins: number; // Positive integer representing minutes left until estimated start
} {
  // Use today's date for parsing the appointment time, as queue tracking is always for "today"
  const scheduledTime = parse(appointment.appointmentTime, 'HH:mm:ss', now);
  
  // The estimated start is their scheduled time pushed back by the clinic's total delay
  const estimatedStart = new Date(scheduledTime.getTime() + delayMinutes * 60000);
  
  let waitMins = 0;
  if (isAfter(estimatedStart, now)) {
    waitMins = differenceInMinutes(estimatedStart, now);
  } else if (appointment.status === "checked_in") {
    // If estimated start is in the past and they are waiting, they should be next!
    waitMins = 0;
  } else if (isAfter(now, estimatedStart)) {
    // For calculating how overdue it is visually if needed
    waitMins = 0;
  }

  // Only consider it "delayed" if it's more than 9 minutes late from original schedule
  const isDelayed = delayMinutes >= 10;
  
  return { estimatedStart, isDelayed, waitMins };
}

/**
 * Utility to assign a time slot for walk-ins (Quick Add).
 * Finds the latest booked time for today and appends to the end.
 * If the latest booked time is in the past, it just uses the current time + 10 mins buffer.
 */
export function getWalkInTimeSlot(appointments: Appointment[], now: Date, avgConsultationTime: number = 15): string {
  if (appointments.length === 0) {
    // No appointments today, round to next interval
    const nextIntervalMins = Math.ceil(now.getMinutes() / avgConsultationTime) * avgConsultationTime;
    const nextSlot = new Date(now);
    nextSlot.setMinutes(nextIntervalMins, 0, 0);
    return format(nextSlot, "HH:mm:ss");
  }

  // Find the latest appointment time
  const latestAppt = appointments.reduce((latest, current) => {
    if (current.appointmentTime > latest.appointmentTime) {
      return current;
    }
    return latest;
  });

  const latestScheduledTime = parse(latestAppt.appointmentTime, 'HH:mm:ss', now);

  if (isAfter(latestScheduledTime, now)) {
    // The latest appointment is in the future. Add them after that exact slot.
    const newSlot = new Date(latestScheduledTime.getTime() + avgConsultationTime * 60000);
    return format(newSlot, "HH:mm:ss");
  } else {
    // The latest appointment is in the past. 
    // They are walking into an empty schedule. Give them the next round interval from NOW.
    const nextIntervalMins = Math.ceil(now.getMinutes() / avgConsultationTime) * avgConsultationTime;
    const nextSlot = new Date(now);
    nextSlot.setMinutes(nextIntervalMins, 0, 0);
    return format(nextSlot, "HH:mm:ss");
  }
}
