CREATE TABLE "clinic_gallery" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"url" text NOT NULL,
	"caption" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinic_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price_paise" integer,
	"duration_minutes" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"lead_id" uuid,
	"action_type" text NOT NULL,
	"notes" text,
	"latitude" text,
	"longitude" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" uuid NOT NULL,
	"employee_code" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"role" text DEFAULT 'staff' NOT NULL,
	"department" text DEFAULT 'sales' NOT NULL,
	"manager_id" uuid,
	"territory_cities" text[] DEFAULT '{}' NOT NULL,
	"territory_regions" text[] DEFAULT '{}' NOT NULL,
	"target_monthly_leads" integer DEFAULT 30,
	"target_monthly_conversions" integer DEFAULT 5,
	"is_active" boolean DEFAULT true NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employees_auth_user_id_unique" UNIQUE("auth_user_id"),
	CONSTRAINT "employees_employee_code_unique" UNIQUE("employee_code"),
	CONSTRAINT "employees_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "marketing_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"type" text DEFAULT 'qr' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"signups" integer DEFAULT 0 NOT NULL,
	"target_clicks" integer DEFAULT 0,
	"destination_url" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_content" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "marketing_campaigns_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "marketing_click_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"clicked_at" timestamp DEFAULT now() NOT NULL,
	"user_agent" text,
	"referrer" text
);
--> statement-breakpoint
CREATE TABLE "marketing_signups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"clinic_id" uuid NOT NULL,
	"signed_up_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid,
	"appointment_id" uuid,
	"user_type" text DEFAULT 'patient' NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "qr_scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"qr_code_id" uuid,
	"clinic_id" uuid,
	"placement" text DEFAULT 'general' NOT NULL,
	"scanned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unclaimed_clinics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"doctor_name" text NOT NULL,
	"clinic_name" text NOT NULL,
	"specialty" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"address" text NOT NULL,
	"phone" text,
	"is_claimed" boolean DEFAULT false NOT NULL,
	"claimed_clinic_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unclaimed_clinics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DROP INDEX "reviews_appointment_unique";--> statement-breakpoint
ALTER TABLE "reminder_logs" ALTER COLUMN "appointment_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reminder_logs" ALTER COLUMN "channel" SET DEFAULT 'whatsapp';--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "patient_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "appointment_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "fee_collected" integer;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "degree" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "free_followup_days" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "hero_image_url" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "instagram_url" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "whatsapp_number" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "facebook_url" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "youtube_url" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "website_url" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "vitals_presets" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "complaint_presets" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "diagnosis_presets" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "treatment_presets" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "assigned_employee_id" uuid;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "assigned_manager_id" uuid;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "lead_category" text DEFAULT 'A' NOT NULL;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "message_sent_step" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "domain_pillar" text;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "clinic_slug" text;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "access_pin" text;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "degree" text;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "consultation_fee" integer;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "experience_years" integer;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "timings" text;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "about" text;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "page_view_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD COLUMN "last_viewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD COLUMN "follow_up_appointment_id" uuid;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD COLUMN "is_free" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD COLUMN "fee_override" integer;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD COLUMN "source_type" text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_status" text DEFAULT 'paid' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "plan_type" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "courier_name" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tracking_number" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivered_at" timestamp;--> statement-breakpoint
ALTER TABLE "reminder_logs" ADD COLUMN "clinic_id" uuid;--> statement-breakpoint
ALTER TABLE "reminder_logs" ADD COLUMN "recipient_phone" text;--> statement-breakpoint
ALTER TABLE "reminder_logs" ADD COLUMN "error_payload" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "source" text DEFAULT 'internal' NOT NULL;--> statement-breakpoint
ALTER TABLE "clinic_gallery" ADD CONSTRAINT "clinic_gallery_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_services" ADD CONSTRAINT "clinic_services_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_activities" ADD CONSTRAINT "employee_activities_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_activities" ADD CONSTRAINT "employee_activities_lead_id_doctor_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."doctor_leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_manager_id_employees_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_click_logs" ADD CONSTRAINT "marketing_click_logs_campaign_id_marketing_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."marketing_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_signups" ADD CONSTRAINT "marketing_signups_campaign_id_marketing_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."marketing_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_signups" ADD CONSTRAINT "marketing_signups_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_scans" ADD CONSTRAINT "qr_scans_qr_code_id_qr_codes_id_fk" FOREIGN KEY ("qr_code_id") REFERENCES "public"."qr_codes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_scans" ADD CONSTRAINT "qr_scans_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unclaimed_clinics" ADD CONSTRAINT "unclaimed_clinics_claimed_clinic_id_clinics_id_fk" FOREIGN KEY ("claimed_clinic_id") REFERENCES "public"."clinics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "clinic_gallery_clinic_idx" ON "clinic_gallery" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "clinic_services_clinic_idx" ON "clinic_services" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "employee_activities_emp_idx" ON "employee_activities" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "employee_activities_lead_idx" ON "employee_activities" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "employee_activities_created_idx" ON "employee_activities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "employees_role_idx" ON "employees" USING btree ("role");--> statement-breakpoint
CREATE INDEX "employees_manager_idx" ON "employees" USING btree ("manager_id");--> statement-breakpoint
CREATE INDEX "employees_is_active_idx" ON "employees" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "employees_email_idx" ON "employees" USING btree ("email");--> statement-breakpoint
CREATE INDEX "marketing_campaigns_code_idx" ON "marketing_campaigns" USING btree ("code");--> statement-breakpoint
CREATE INDEX "marketing_campaigns_status_idx" ON "marketing_campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "marketing_click_logs_campaign_idx" ON "marketing_click_logs" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "marketing_click_logs_clicked_at_idx" ON "marketing_click_logs" USING btree ("clicked_at");--> statement-breakpoint
CREATE INDEX "marketing_signups_campaign_idx" ON "marketing_signups" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "marketing_signups_clinic_idx" ON "marketing_signups" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "push_subscriptions_clinic_idx" ON "push_subscriptions" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "push_subscriptions_appointment_idx" ON "push_subscriptions" USING btree ("appointment_id");--> statement-breakpoint
CREATE INDEX "push_subscriptions_endpoint_idx" ON "push_subscriptions" USING btree ("endpoint");--> statement-breakpoint
CREATE UNIQUE INDEX "push_subscriptions_endpoint_appt_unique" ON "push_subscriptions" USING btree ("endpoint","appointment_id");--> statement-breakpoint
CREATE INDEX "qr_scans_qr_code_id_idx" ON "qr_scans" USING btree ("qr_code_id");--> statement-breakpoint
CREATE INDEX "qr_scans_clinic_id_idx" ON "qr_scans" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "qr_scans_placement_idx" ON "qr_scans" USING btree ("placement");--> statement-breakpoint
CREATE INDEX "unclaimed_clinics_city_idx" ON "unclaimed_clinics" USING btree ("city");--> statement-breakpoint
CREATE INDEX "unclaimed_clinics_slug_idx" ON "unclaimed_clinics" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "unclaimed_clinics_is_claimed_idx" ON "unclaimed_clinics" USING btree ("is_claimed");--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD CONSTRAINT "doctor_leads_assigned_employee_id_employees_id_fk" FOREIGN KEY ("assigned_employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_leads" ADD CONSTRAINT "doctor_leads_assigned_manager_id_employees_id_fk" FOREIGN KEY ("assigned_manager_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_follow_up_appointment_id_appointments_id_fk" FOREIGN KEY ("follow_up_appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminder_logs" ADD CONSTRAINT "reminder_logs_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "doctor_leads_assigned_employee_idx" ON "doctor_leads" USING btree ("assigned_employee_id");--> statement-breakpoint
CREATE INDEX "doctor_leads_assigned_manager_idx" ON "doctor_leads" USING btree ("assigned_manager_id");--> statement-breakpoint
CREATE INDEX "doctor_leads_category_idx" ON "doctor_leads" USING btree ("lead_category");--> statement-breakpoint
CREATE UNIQUE INDEX "doctor_leads_clinic_slug_unique_idx" ON "doctor_leads" USING btree ("clinic_slug");--> statement-breakpoint
CREATE INDEX "follow_ups_follow_up_appointment_id_idx" ON "follow_ups" USING btree ("follow_up_appointment_id");--> statement-breakpoint
CREATE INDEX "follow_ups_clinic_patient_status_idx" ON "follow_ups" USING btree ("clinic_id","patient_id","status");--> statement-breakpoint
CREATE INDEX "follow_ups_due_date_status_idx" ON "follow_ups" USING btree ("due_date","status");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reminder_logs_clinic_idx" ON "reminder_logs" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "reminder_logs_status_idx" ON "reminder_logs" USING btree ("status");