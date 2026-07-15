CREATE TABLE "doctor_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doctor_name" text NOT NULL,
	"clinic_name" text,
	"phone" text NOT NULL,
	"specialty" text,
	"city" text,
	"source" text DEFAULT 'online' NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "billing_address" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "gstin" text;--> statement-breakpoint
CREATE INDEX "doctor_leads_status_idx" ON "doctor_leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "doctor_leads_created_at_idx" ON "doctor_leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "clinics_created_at_idx" ON "clinics" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "payment_logs_paid_at_idx" ON "payment_logs" USING btree ("paid_at");