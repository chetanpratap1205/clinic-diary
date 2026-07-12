CREATE TABLE "qr_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"clinic_id" uuid,
	"assigned_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "qr_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"appointment_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"is_verified" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "token_number" integer;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "google_maps_url" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "medical_notes" text;--> statement-breakpoint
ALTER TABLE "visit_notes" ADD COLUMN "vitals" text;--> statement-breakpoint
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "qr_codes_clinic_id_idx" ON "qr_codes" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "qr_codes_code_idx" ON "qr_codes" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_appointment_unique" ON "reviews" USING btree ("appointment_id");--> statement-breakpoint
CREATE INDEX "reviews_clinic_idx" ON "reviews" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "payment_logs_clinic_idx" ON "payment_logs" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "reminder_logs_appointment_idx" ON "reminder_logs" USING btree ("appointment_id");--> statement-breakpoint
CREATE INDEX "visit_notes_appointment_idx" ON "visit_notes" USING btree ("appointment_id");--> statement-breakpoint
CREATE INDEX "visit_notes_patient_idx" ON "visit_notes" USING btree ("patient_id");