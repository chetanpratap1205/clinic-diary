import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  date,
  time,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ─── Clinics (one per doctor/practice) ───────────────────────────────────────
export const clinics = pgTable("clinics", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  doctorName: text("doctor_name").notNull(),
  specialty: text("specialty").notNull(),
  phone: text("phone").notNull(),
  logoUrl: text("logo_url"),
  consultationFee: integer("consultation_fee").default(0),
  averageConsultationMinutes: integer("average_consultation_minutes").default(15).notNull(),
  themeColor: text("theme_color").default("#0ea5e9"),
  address: text("address"),
  googleMapsUrl: text("google_maps_url"),
  about: text("about"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Clinic Admins (links auth users to clinics) ─────────────────────────────
export const clinicAdmins = pgTable("clinic_admins", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id, { onDelete: "cascade" }),
  authUserId: uuid("auth_user_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


// ─── Availability (weekly schedule per clinic) ────────────────────────────────
export const availability = pgTable("availability", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sun,1=Mon,...6=Sat
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  slotDurationMinutes: integer("slot_duration_minutes").default(30).notNull(),
});

// ─── Availability Overrides (holidays/leaves) ─────────────────────────────────
export const availabilityOverrides = pgTable("availability_overrides", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  isClosed: boolean("is_closed").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Patients ──────────────────────────────────────────────────────────────────
export const patients = pgTable(
  "patients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    age: integer("age"),
    gender: text("gender"),
    address: text("address"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("patients_clinic_phone_unique").on(table.clinicId, table.phone),
  ]
);

// ─── Appointments ──────────────────────────────────────────────────────────────
export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    patientId: uuid("patient_id").references(() => patients.id, { onDelete: "set null" }),
    patientName: text("patient_name").notNull(),
    patientPhone: text("patient_phone").notNull(),
    patientEmail: text("patient_email"),
    appointmentDate: date("appointment_date").notNull(),
    appointmentTime: time("appointment_time").notNull(),
    tokenNumber: integer("token_number"),
    status: text("status").notNull().default("confirmed"), // confirmed/cancelled/completed/no_show/checked_in/in_consultation
    checkInTime: timestamp("check_in_time"),
    consultationStartTime: timestamp("consultation_start_time"),
    consultationEndTime: timestamp("consultation_end_time"),
    notes: text("notes"),
    cancelToken: text("cancel_token"),
    rescheduleToken: text("reschedule_token"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("appointments_clinic_date_time_unique").on(
      table.clinicId,
      table.appointmentDate,
      table.appointmentTime
    ),
    index("appointments_clinic_date_idx").on(
      table.clinicId,
      table.appointmentDate
    ),
  ]
);

// ─── Follow Ups ────────────────────────────────────────────────────────────────
export const followUps = pgTable(
  "follow_ups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: "set null" }),
    dueDate: date("due_date").notNull(),
    status: text("status").notNull().default("pending"), // pending/completed/missed
    notes: text("notes"),
    reminderSent3d: boolean("reminder_sent_3d").default(false),
    reminderSent1d: boolean("reminder_sent_1d").default(false),
    reminderSent0d: boolean("reminder_sent_0d").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    index("follow_ups_clinic_due_date_status_idx").on(
      table.clinicId,
      table.dueDate,
      table.status
    ),
  ]
);

// ─── Visit Notes ───────────────────────────────────────────────────────────────
export const visitNotes = pgTable("visit_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  appointmentId: uuid("appointment_id")
    .notNull()
    .references(() => appointments.id, { onDelete: "cascade" }),
  complaint: text("complaint"),
  vitals: text("vitals"),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  followUpRequired: boolean("follow_up_required").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Reminder Logs ─────────────────────────────────────────────────────────────
export const reminderLogs = pgTable("reminder_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  appointmentId: uuid("appointment_id")
    .notNull()
    .references(() => appointments.id, { onDelete: "cascade" }),
  channel: text("channel").notNull(), // sms/whatsapp/email/console
  triggerType: text("trigger_type").notNull(), // confirmation/reminder_24h/reminder_1h
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  status: text("status").notNull().default("sent"), // sent/failed
  message: text("message"),
});

// ─── Subscriptions (Razorpay) ──────────────────────────────────────────────────
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .unique() // One active subscription per clinic typically
    .references(() => clinics.id, { onDelete: "cascade" }),
  razorpayCustomerId: text("razorpay_customer_id"),
  razorpaySubscriptionId: text("razorpay_subscription_id"),
  planId: text("plan_id").notNull(), // monthly, quarterly, yearly
  status: text("status").notNull().default("active"), // active, cancelled, past_due
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Payment Logs (one row per successful Razorpay payment) ───────────────────
export const paymentLogs = pgTable("payment_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id, { onDelete: "cascade" }),
  razorpayOrderId: text("razorpay_order_id").notNull(),
  razorpayPaymentId: text("razorpay_payment_id").notNull(),
  planId: text("plan_id").notNull(),       // monthly / quarterly / yearly
  planName: text("plan_name").notNull(),   // "1 Month" / "3 Months" / "12 Months"
  amountPaise: integer("amount_paise").notNull(), // amount in paise (e.g. 129900)
  status: text("status").notNull().default("paid"),
  paidAt: timestamp("paid_at").defaultNow().notNull(),
});

// ─── Type Exports ──────────────────────────────────────────────────────────────
export type Clinic = typeof clinics.$inferSelect;
export type NewClinic = typeof clinics.$inferInsert;
export type ClinicAdmin = typeof clinicAdmins.$inferSelect;
export type Availability = typeof availability.$inferSelect;
export type AvailabilityOverride = typeof availabilityOverrides.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
export type FollowUp = typeof followUps.$inferSelect;
export type NewFollowUp = typeof followUps.$inferInsert;
export type VisitNote = typeof visitNotes.$inferSelect;
export type NewVisitNote = typeof visitNotes.$inferInsert;
export type ReminderLog = typeof reminderLogs.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type PaymentLog = typeof paymentLogs.$inferSelect;
export type NewPaymentLog = typeof paymentLogs.$inferInsert;
