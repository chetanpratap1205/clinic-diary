-- P0: Follow-Up System — Golden Thread Migration
-- Adds: is_free, fee_override, source_type, follow_up_appointment_id to follow_ups
-- Adds: free_followup_days to clinics
-- Adds: scale indexes

ALTER TABLE "follow_ups" ADD COLUMN "is_free" boolean DEFAULT false NOT NULL;-->statement-breakpoint
ALTER TABLE "follow_ups" ADD COLUMN "fee_override" integer;-->statement-breakpoint
ALTER TABLE "follow_ups" ADD COLUMN "source_type" text DEFAULT 'manual' NOT NULL;-->statement-breakpoint
ALTER TABLE "follow_ups" ADD COLUMN "follow_up_appointment_id" uuid;-->statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "free_followup_days" integer DEFAULT 0;-->statement-breakpoint

ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_follow_up_appointment_id_appointments_id_fk" FOREIGN KEY ("follow_up_appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;-->statement-breakpoint

-- Scale indexes for lakh-patient queries
CREATE INDEX "follow_ups_follow_up_appointment_id_idx" ON "follow_ups" USING btree ("follow_up_appointment_id");-->statement-breakpoint
CREATE INDEX "follow_ups_clinic_patient_status_idx" ON "follow_ups" USING btree ("clinic_id", "patient_id", "status");-->statement-breakpoint
CREATE INDEX "follow_ups_due_date_status_idx" ON "follow_ups" USING btree ("due_date", "status");-->statement-breakpoint
CREATE INDEX "follow_ups_is_free_idx" ON "follow_ups" USING btree ("is_free");-->statement-breakpoint
CREATE INDEX "appointments_patient_phone_status_idx" ON "appointments" USING btree ("patient_phone", "status");
