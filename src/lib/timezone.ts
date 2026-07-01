import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { startOfWeek, endOfWeek, format } from "date-fns";

export const CLINIC_TIMEZONE = "Asia/Kolkata";

/**
 * Returns the current date in the clinic's timezone formatted as YYYY-MM-DD
 */
export function getClinicTodayDate(): string {
  return formatInTimeZone(new Date(), CLINIC_TIMEZONE, "yyyy-MM-dd");
}

/**
 * Returns the start of the current week in the clinic's timezone formatted as YYYY-MM-DD
 */
export function getClinicWeekStart(): string {
  // Get the exact current time in the clinic's timezone
  const nowInClinic = toZonedTime(new Date(), CLINIC_TIMEZONE);
  return format(startOfWeek(nowInClinic, { weekStartsOn: 1 }), "yyyy-MM-dd");
}

/**
 * Returns the end of the current week in the clinic's timezone formatted as YYYY-MM-DD
 */
export function getClinicWeekEnd(): string {
  const nowInClinic = toZonedTime(new Date(), CLINIC_TIMEZONE);
  return format(endOfWeek(nowInClinic, { weekStartsOn: 1 }), "yyyy-MM-dd");
}
