CREATE TABLE "commission_payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"lead_id" uuid,
	"payment_log_id" uuid,
	"type" text NOT NULL,
	"base_paise" integer NOT NULL,
	"pct" integer NOT NULL,
	"commission_paise" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "growth_partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"city" text,
	"region" text,
	"product" text DEFAULT 'doctor' NOT NULL,
	"target_monthly" integer DEFAULT 10,
	"commission_first_sale_pct" integer DEFAULT 30,
	"commission_renewal_pct" integer DEFAULT 10,
	"referral_code" text,
	"is_active" boolean DEFAULT true,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "growth_partners_auth_user_id_unique" UNIQUE("auth_user_id"),
	CONSTRAINT "growth_partners_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "lead_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"partner_id" uuid NOT NULL,
	"type" text NOT NULL,
	"notes" text,
	"previous_status" text,
	"new_status" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "referred_by" uuid;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "assigned_to" uuid;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "priority" text DEFAULT 'normal' NOT NULL;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "follow_up_date" timestamp;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "last_contacted_at" timestamp;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "demo_scheduled_at" timestamp;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "converted_at" timestamp;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "conversion_amount" integer;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "commission_paid" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "qr_codes" ADD COLUMN "usage_type" text DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE "commission_payouts" ADD CONSTRAINT "commission_payouts_partner_id_growth_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."growth_partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_payouts" ADD CONSTRAINT "commission_payouts_lead_id_doctor_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."doctor_leads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_payouts" ADD CONSTRAINT "commission_payouts_payment_log_id_payment_logs_id_fk" FOREIGN KEY ("payment_log_id") REFERENCES "public"."payment_logs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_lead_id_doctor_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."doctor_leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_partner_id_growth_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."growth_partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "commission_payouts_partner_idx" ON "commission_payouts" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "commission_payouts_status_idx" ON "commission_payouts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "growth_partners_region_idx" ON "growth_partners" USING btree ("region");--> statement-breakpoint
CREATE INDEX "growth_partners_product_idx" ON "growth_partners" USING btree ("product");--> statement-breakpoint
CREATE INDEX "lead_activities_lead_idx" ON "lead_activities" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "lead_activities_partner_idx" ON "lead_activities" USING btree ("partner_id");--> statement-breakpoint
ALTER TABLE "clinics" ADD CONSTRAINT "clinics_referred_by_growth_partners_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."growth_partners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD CONSTRAINT "doctor_leads_assigned_to_growth_partners_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."growth_partners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointments_status_idx" ON "appointments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "doctor_leads_priority_idx" ON "doctor_leads" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "doctor_leads_assigned_to_idx" ON "doctor_leads" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "follow_ups_status_idx" ON "follow_ups" USING btree ("status");--> statement-breakpoint
CREATE INDEX "follow_ups_patient_idx" ON "follow_ups" USING btree ("patient_id");