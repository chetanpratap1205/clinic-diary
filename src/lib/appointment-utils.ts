import type { Appointment } from "@/db/schema";

/**
 * Safely normalizes an appointment record coming from Drizzle ORM (camelCase)
 * OR raw Supabase Realtime postgres_changes payloads (snake_case).
 * Ensures all essential string/number/date properties are present and valid,
 * eliminating undefined property crashes across devices.
 */
export function normalizeAppointment(raw: any): Appointment {
  if (!raw) {
    return {
      id: "",
      clinicId: "",
      patientId: null,
      patientName: "Patient",
      patientPhone: "",
      patientEmail: null,
      appointmentDate: new Date().toISOString().split("T")[0],
      appointmentTime: "00:00:00",
      tokenNumber: null,
      status: "confirmed",
      checkInTime: null,
      consultationStartTime: null,
      consultationEndTime: null,
      notes: null,
      cancelToken: null,
      rescheduleToken: null,
      acquisitionSource: null,
      feeCollected: null,
      createdAt: new Date(),
    };
  }

  const id = raw.id ?? "";
  const clinicId = raw.clinicId ?? raw.clinic_id ?? "";
  const patientId = raw.patientId ?? raw.patient_id ?? null;
  const patientName = raw.patientName ?? raw.patient_name ?? "Patient";
  const patientPhone = raw.patientPhone ?? raw.patient_phone ?? "";
  const patientEmail = raw.patientEmail ?? raw.patient_email ?? null;

  const appointmentDate = raw.appointmentDate ?? raw.appointment_date ?? new Date().toISOString().split("T")[0];
  const appointmentTime = raw.appointmentTime ?? raw.appointment_time ?? "00:00:00";

  const rawToken = raw.tokenNumber ?? raw.token_number;
  const tokenNumber = rawToken !== undefined && rawToken !== null ? Number(rawToken) : null;

  const status = raw.status ?? "confirmed";

  const checkInTime = raw.checkInTime ?? raw.check_in_time ?? null;
  const consultationStartTime = raw.consultationStartTime ?? raw.consultation_start_time ?? null;
  const consultationEndTime = raw.consultationEndTime ?? raw.consultation_end_time ?? null;

  const notes = raw.notes ?? null;
  const cancelToken = raw.cancelToken ?? raw.cancel_token ?? null;
  const rescheduleToken = raw.rescheduleToken ?? raw.reschedule_token ?? null;
  const acquisitionSource = raw.acquisitionSource ?? raw.acquisition_source ?? null;

  const rawFee = raw.feeCollected ?? raw.fee_collected;
  const feeCollected = rawFee !== undefined && rawFee !== null ? Number(rawFee) : null;

  const createdAt = raw.createdAt ?? raw.created_at ?? new Date();

  return {
    id,
    clinicId,
    patientId,
    patientName,
    patientPhone,
    patientEmail,
    appointmentDate: String(appointmentDate),
    appointmentTime: String(appointmentTime),
    tokenNumber,
    status: String(status),
    checkInTime,
    consultationStartTime,
    consultationEndTime,
    notes,
    cancelToken,
    rescheduleToken,
    acquisitionSource,
    feeCollected,
    createdAt,
  };
}

/**
 * Guarantees a unique HH:mm:ss time string by resolving collisions against existing times.
 * Prevents PostgreSQL unique index constraint failures (clinic_id, appointment_date, appointment_time).
 */
export function ensureUniqueTime(baseTime: string, existingTimes: Set<string>): string {
  let timeStr = baseTime.length === 5 ? `${baseTime}:00` : baseTime;
  if (!existingTimes.has(timeStr)) return timeStr;

  const parts = timeStr.split(":").map(Number);
  let totalSecs = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);

  while (existingTimes.has(timeStr)) {
    totalSecs = (totalSecs + 1) % 86400;
    const nh = String(Math.floor(totalSecs / 3600)).padStart(2, "0");
    const nm = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, "0");
    const ns = String(totalSecs % 60).padStart(2, "0");
    timeStr = `${nh}:${nm}:${ns}`;
  }
  return timeStr;
}
