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
  billingAddress: text("billing_address"),
  state: text("state"),
  gstin: text("gstin"),
  googleMapsUrl: text("google_maps_url"),
  about: text("about"),
  referredBy: uuid("referred_by").references(() => growthPartners.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("clinics_created_at_idx").on(table.createdAt),
]);

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
    medicalNotes: text("medical_notes"),
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
    acquisitionSource: text("acquisition_source"), // qr_inside, qr_outside, sticker, etc.
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
    index("appointments_status_idx").on(table.status),
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
    index("follow_ups_status_idx").on(table.status),
    index("follow_ups_patient_idx").on(table.patientId),
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
}, (table) => [
  index("visit_notes_appointment_idx").on(table.appointmentId),
  index("visit_notes_patient_idx").on(table.patientId),
]);

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
}, (table) => [
  index("reminder_logs_appointment_idx").on(table.appointmentId),
]);

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
}, (table) => [
  index("payment_logs_clinic_idx").on(table.clinicId),
  index("payment_logs_paid_at_idx").on(table.paidAt),
]);

// ─── QR Codes (Pre-printed redirect codes for field sales) ──────────────────
export const qrCodes = pgTable(
  "qr_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull().unique(),          // e.g. "Q-001", "CD-X4K2"
    clinicId: uuid("clinic_id").references(() => clinics.id, { onDelete: "set null" }),
    usageType: text("usage_type").notNull().default("general"), // general, reception, window, sticker
    assignedAt: timestamp("assigned_at"),
    printedAt: timestamp("printed_at"),
    notes: text("notes"),                            // e.g. "Given to Dr. Sharma, Pune demo"
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("qr_codes_clinic_id_idx").on(table.clinicId),
    index("qr_codes_code_idx").on(table.code),
  ]
);

// ─── Reviews (Patient feedback post-appointment) ───────────────────────────────
export const reviews = pgTable(
  "reviews",
  {
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
    rating: integer("rating").notNull(), // 1 to 5
    comment: text("comment"),
    isVerified: boolean("is_verified").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // One review per appointment
    uniqueIndex("reviews_appointment_unique").on(table.appointmentId),
    index("reviews_clinic_idx").on(table.clinicId),
  ]
);

// ─── E-commerce (Marketing Shop) ────────────────────────────────────────────────
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // in paise (e.g. 50000 = ₹500)
  imageUrl: text("image_url"),
  category: text("category").notNull(), // sticker, acrylic, digital, print
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // in paise
  status: text("status").notNull().default("pending"), // pending, paid, processing, shipped, delivered
  shippingAddress: text("shipping_address"),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  trackingUrl: text("tracking_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("orders_clinic_idx").on(table.clinicId)
]);

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  price: integer("price").notNull(), // snapshot of price at time of purchase
  generatedUrl: text("generated_url"), // For custom tracked QR URLs
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("order_items_order_idx").on(table.orderId)
]);

// ─── Growth Partners (Field Sales Team) ────────────────────────────────────────
export const growthPartners = pgTable("growth_partners", {
  id: uuid("id").defaultRandom().primaryKey(),
  authUserId: uuid("auth_user_id").notNull().unique(), // Supabase Auth user ID
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  city: text("city"),
  region: text("region"),               // Territory they cover, e.g. "Pune West"
  // Which NatureXpress product this partner sells.
  // 'doctor' | 'kisan' | 'eudr' — defaults to 'doctor' for all existing records.
  product: text("product").notNull().default("doctor"),
  targetMonthly: integer("target_monthly").default(10), // Monthly lead conversion target
  commissionFirstSalePct: integer("commission_first_sale_pct").default(30),  // 30% on first sale
  commissionRenewalPct: integer("commission_renewal_pct").default(10),       // 10% on renewals
  referralCode: text("referral_code").unique(), // e.g. "GP-RAHUL-001"
  isActive: boolean("is_active").default(true),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("growth_partners_region_idx").on(table.region),
  index("growth_partners_product_idx").on(table.product),
]);

// ─── Doctor Leads (CRM) ────────────────────────────────────────────────────────
export const doctorLeads = pgTable("doctor_leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  assignedTo: uuid("assigned_to").references(() => growthPartners.id, { onDelete: "set null" }),
  doctorName: text("doctor_name").notNull(),
  clinicName: text("clinic_name"),
  phone: text("phone").notNull(),
  email: text("email"),
  specialty: text("specialty"),
  city: text("city"),
  address: text("address"),
  source: text("source").notNull().default("online"), // online, field_visit, referral, imported
  status: text("status").notNull().default("new"),     // new, contacted, demo_scheduled, converted, rejected
  priority: text("priority").notNull().default("normal"), // hot, warm, normal, cold
  notes: text("notes"),
  followUpDate: timestamp("follow_up_date"),
  lastContactedAt: timestamp("last_contacted_at"),
  demoScheduledAt: timestamp("demo_scheduled_at"),
  convertedAt: timestamp("converted_at"),
  conversionAmount: integer("conversion_amount"), // subscription amount in paise at time of conversion
  commissionPaid: boolean("commission_paid").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("doctor_leads_status_idx").on(table.status),
  index("doctor_leads_priority_idx").on(table.priority),
  index("doctor_leads_assigned_to_idx").on(table.assignedTo),
  index("doctor_leads_created_at_idx").on(table.createdAt),
]);

// ─── Lead Activities (Visits, Calls, Notes) ────────────────────────────────────
export const leadActivities = pgTable("lead_activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id").notNull().references(() => doctorLeads.id, { onDelete: "cascade" }),
  partnerId: uuid("partner_id").notNull().references(() => growthPartners.id),
  type: text("type").notNull(), // visit, call, note, status_change, whatsapp
  notes: text("notes"),
  previousStatus: text("previous_status"),
  newStatus: text("new_status"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("lead_activities_lead_idx").on(table.leadId),
  index("lead_activities_partner_idx").on(table.partnerId),
]);

// ─── Commission Payouts ────────────────────────────────────────────────────────
// Tracks 30% on first sale, 10% on renewals per partner
export const commissionPayouts = pgTable("commission_payouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  partnerId: uuid("partner_id").notNull().references(() => growthPartners.id),
  leadId: uuid("lead_id").references(() => doctorLeads.id, { onDelete: "set null" }),
  paymentLogId: uuid("payment_log_id").references(() => paymentLogs.id, { onDelete: "set null" }),
  type: text("type").notNull(),         // first_sale | renewal
  basePaise: integer("base_paise").notNull(),   // subscription amount in paise
  pct: integer("pct").notNull(),               // 30 or 10
  commissionPaise: integer("commission_paise").notNull(), // base * pct / 100
  status: text("status").notNull().default("pending"), // pending | paid | cancelled
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("commission_payouts_partner_idx").on(table.partnerId),
  index("commission_payouts_status_idx").on(table.status),
]);
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
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type QrCode = typeof qrCodes.$inferSelect;
export type NewQrCode = typeof qrCodes.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type DoctorLead = typeof doctorLeads.$inferSelect;
export type NewDoctorLead = typeof doctorLeads.$inferInsert;
export type GrowthPartner = typeof growthPartners.$inferSelect;
export type NewGrowthPartner = typeof growthPartners.$inferInsert;
export type LeadActivity = typeof leadActivities.$inferSelect;
export type NewLeadActivity = typeof leadActivities.$inferInsert;
export type CommissionPayout = typeof commissionPayouts.$inferSelect;
export type NewCommissionPayout = typeof commissionPayouts.$inferInsert;
