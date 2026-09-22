ALTER TABLE "lead_activities" ALTER COLUMN "partner_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "google_review_url" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "enable_auto_review_booster" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "verification_status" text DEFAULT 'needs_verification' NOT NULL;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "last_contact_method" text;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "last_call_outcome" text;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "google_maps_url" text;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "instagram_url" text;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "website_url" text;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "meta_ads_status" text DEFAULT 'unverified' NOT NULL;--> statement-breakpoint
ALTER TABLE "lead_activities" ADD COLUMN "employee_id" uuid;--> statement-breakpoint
ALTER TABLE "lead_activities" ADD COLUMN "performed_by" text;--> statement-breakpoint
ALTER TABLE "visit_notes" ADD COLUMN "rx_image_url" text;--> statement-breakpoint
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointments_patient_id_idx" ON "appointments" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "availability_clinic_id_idx" ON "availability" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "availability_overrides_clinic_id_idx" ON "availability_overrides" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "clinic_admins_clinic_id_idx" ON "clinic_admins" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "clinics_referred_by_idx" ON "clinics" USING btree ("referred_by");--> statement-breakpoint
CREATE INDEX "commission_payouts_lead_id_idx" ON "commission_payouts" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "commission_payouts_payment_log_id_idx" ON "commission_payouts" USING btree ("payment_log_id");--> statement-breakpoint
CREATE INDEX "doctor_leads_verification_idx" ON "doctor_leads" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "follow_ups_appointment_id_idx" ON "follow_ups" USING btree ("appointment_id");--> statement-breakpoint
CREATE INDEX "lead_activities_employee_idx" ON "lead_activities" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "order_items_product_id_idx" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "reviews_appointment_id_idx" ON "reviews" USING btree ("appointment_id");--> statement-breakpoint
CREATE INDEX "reviews_patient_id_idx" ON "reviews" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "unclaimed_clinics_claimed_clinic_id_idx" ON "unclaimed_clinics" USING btree ("claimed_clinic_id");--> statement-breakpoint
CREATE INDEX "visit_notes_clinic_id_idx" ON "visit_notes" USING btree ("clinic_id");