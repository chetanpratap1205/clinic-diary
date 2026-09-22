-- 1. Enable RLS on all 30 public schema tables
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_click_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE unclaimed_clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. Create covering indexes for all unindexed foreign key columns (Performance Advisors)
CREATE INDEX IF NOT EXISTS appointments_patient_id_idx ON appointments (patient_id);
CREATE INDEX IF NOT EXISTS availability_clinic_id_idx ON availability (clinic_id);
CREATE INDEX IF NOT EXISTS availability_overrides_clinic_id_idx ON availability_overrides (clinic_id);
CREATE INDEX IF NOT EXISTS clinic_admins_clinic_id_idx ON clinic_admins (clinic_id);
CREATE INDEX IF NOT EXISTS clinics_referred_by_idx ON clinics (referred_by);
CREATE INDEX IF NOT EXISTS commission_payouts_lead_id_idx ON commission_payouts (lead_id);
CREATE INDEX IF NOT EXISTS commission_payouts_payment_log_id_idx ON commission_payouts (payment_log_id);
CREATE INDEX IF NOT EXISTS follow_ups_appointment_id_idx ON follow_ups (appointment_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON order_items (product_id);
CREATE INDEX IF NOT EXISTS reviews_appointment_id_idx ON reviews (appointment_id);
CREATE INDEX IF NOT EXISTS reviews_patient_id_idx ON reviews (patient_id);
CREATE INDEX IF NOT EXISTS unclaimed_clinics_claimed_clinic_id_idx ON unclaimed_clinics (claimed_clinic_id);
CREATE INDEX IF NOT EXISTS visit_notes_clinic_id_idx ON visit_notes (clinic_id);

-- 3. Drop existing policies to avoid conflicts if re-running
DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename); 
    END LOOP; 
END $$;

-- 4. Public Read Policies
CREATE POLICY "Public clinics are viewable by everyone" ON clinics FOR SELECT USING (true);
CREATE POLICY "Public availability is viewable by everyone" ON availability FOR SELECT USING (true);
CREATE POLICY "Public availability overrides are viewable by everyone" ON availability_overrides FOR SELECT USING (true);
CREATE POLICY "Public can view gallery" ON clinic_gallery FOR SELECT USING (true);
CREATE POLICY "Public can view services" ON clinic_services FOR SELECT USING (true);
CREATE POLICY "Public can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Public can view unclaimed clinics" ON unclaimed_clinics FOR SELECT USING (true);
CREATE POLICY "Anyone can view qr_codes" ON qr_codes FOR SELECT USING (true);
CREATE POLICY "Public can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public can view marketing campaigns" ON marketing_campaigns FOR SELECT USING (true);

-- 5. Public Insert & Interaction Policies
CREATE POLICY "Anyone can create an appointment" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can submit a review" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can log marketing clicks" ON marketing_click_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can record marketing signups" ON marketing_signups FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can record qr scans" ON qr_scans FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can subscribe to push notifications" ON push_subscriptions FOR INSERT WITH CHECK (true);

-- 6. Clinic Admin Policies
-- clinics
CREATE POLICY "Admins can update their own clinics" ON clinics FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = id AND auth_user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = id AND auth_user_id = (select auth.uid())));

-- availability
CREATE POLICY "Admins can insert availability" ON availability FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = availability.clinic_id AND auth_user_id = (select auth.uid()))
);
CREATE POLICY "Admins can update availability" ON availability FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = availability.clinic_id AND auth_user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = availability.clinic_id AND auth_user_id = (select auth.uid())));
CREATE POLICY "Admins can delete availability" ON availability FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = availability.clinic_id AND auth_user_id = (select auth.uid()))
);

-- availability_overrides
CREATE POLICY "Admins can insert overrides" ON availability_overrides FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = availability_overrides.clinic_id AND auth_user_id = (select auth.uid()))
);
CREATE POLICY "Admins can update overrides" ON availability_overrides FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = availability_overrides.clinic_id AND auth_user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = availability_overrides.clinic_id AND auth_user_id = (select auth.uid())));
CREATE POLICY "Admins can delete overrides" ON availability_overrides FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = availability_overrides.clinic_id AND auth_user_id = (select auth.uid()))
);

-- appointments (Read, Update, Delete for Admins)
CREATE POLICY "Admins can view their appointments" ON appointments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = appointments.clinic_id AND auth_user_id = (select auth.uid()))
);
CREATE POLICY "Admins can update their appointments" ON appointments FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = appointments.clinic_id AND auth_user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = appointments.clinic_id AND auth_user_id = (select auth.uid())));
CREATE POLICY "Admins can delete their appointments" ON appointments FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = appointments.clinic_id AND auth_user_id = (select auth.uid()))
);

-- patients
CREATE POLICY "Admins can manage patients" ON patients FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = patients.clinic_id AND auth_user_id = (select auth.uid()))
);

-- follow_ups
CREATE POLICY "Admins can manage follow ups" ON follow_ups FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = follow_ups.clinic_id AND auth_user_id = (select auth.uid()))
);

-- visit_notes
CREATE POLICY "Admins can manage visit notes" ON visit_notes FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = visit_notes.clinic_id AND auth_user_id = (select auth.uid()))
);

-- subscriptions
CREATE POLICY "Admins can view subscriptions" ON subscriptions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = subscriptions.clinic_id AND auth_user_id = (select auth.uid()))
);

-- payment_logs
CREATE POLICY "Admins can view payment_logs" ON payment_logs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = payment_logs.clinic_id AND auth_user_id = (select auth.uid()))
);

-- reminder_logs
CREATE POLICY "Admins can view their reminder logs" ON reminder_logs FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM appointments 
    JOIN clinic_admins ON appointments.clinic_id = clinic_admins.clinic_id
    WHERE appointments.id = reminder_logs.appointment_id AND clinic_admins.auth_user_id = (select auth.uid())
  )
);

-- clinic_admins (Admin can only see themselves/their clinic's admins)
CREATE POLICY "Admins can view their clinic admins" ON clinic_admins FOR SELECT TO authenticated USING (
  auth_user_id = (select auth.uid())
);

-- reviews
CREATE POLICY "Admins can update and delete reviews" ON reviews FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = reviews.clinic_id AND auth_user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = reviews.clinic_id AND auth_user_id = (select auth.uid())));
CREATE POLICY "Admins can delete reviews" ON reviews FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = reviews.clinic_id AND auth_user_id = (select auth.uid()))
);

-- orders
CREATE POLICY "Admins can manage orders" ON orders FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = orders.clinic_id AND auth_user_id = (select auth.uid()))
);

-- order_items
CREATE POLICY "Admins can manage order items" ON order_items FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM orders
    JOIN clinic_admins ON orders.clinic_id = clinic_admins.clinic_id
    WHERE orders.id = order_items.order_id AND clinic_admins.auth_user_id = (select auth.uid())
  )
);

-- clinic_services (Admin mutation policies - SELECT is handled by public read policy)
CREATE POLICY "Admins can insert services" ON clinic_services FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = clinic_services.clinic_id AND auth_user_id = (select auth.uid()))
);
CREATE POLICY "Admins can update services" ON clinic_services FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = clinic_services.clinic_id AND auth_user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = clinic_services.clinic_id AND auth_user_id = (select auth.uid())));
CREATE POLICY "Admins can delete services" ON clinic_services FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = clinic_services.clinic_id AND auth_user_id = (select auth.uid()))
);

-- clinic_gallery (Admin mutation policies - SELECT is handled by public read policy)
CREATE POLICY "Admins can insert gallery" ON clinic_gallery FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = clinic_gallery.clinic_id AND auth_user_id = (select auth.uid()))
);
CREATE POLICY "Admins can update gallery" ON clinic_gallery FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = clinic_gallery.clinic_id AND auth_user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = clinic_gallery.clinic_id AND auth_user_id = (select auth.uid())));
CREATE POLICY "Admins can delete gallery" ON clinic_gallery FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = clinic_gallery.clinic_id AND auth_user_id = (select auth.uid()))
);

-- qr_codes
CREATE POLICY "Admins can update and delete qr codes" ON qr_codes FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = qr_codes.clinic_id AND auth_user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = qr_codes.clinic_id AND auth_user_id = (select auth.uid())));
CREATE POLICY "Admins can delete qr codes" ON qr_codes FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = qr_codes.clinic_id AND auth_user_id = (select auth.uid()))
);

-- push_subscriptions (Admin read/update/delete - INSERT is handled by public policy)
CREATE POLICY "Admins can view push subscriptions" ON push_subscriptions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = push_subscriptions.clinic_id AND auth_user_id = (select auth.uid()))
);
CREATE POLICY "Admins can update push subscriptions" ON push_subscriptions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = push_subscriptions.clinic_id AND auth_user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = push_subscriptions.clinic_id AND auth_user_id = (select auth.uid())));
CREATE POLICY "Admins can delete push subscriptions" ON push_subscriptions FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = push_subscriptions.clinic_id AND auth_user_id = (select auth.uid()))
);

-- 7. Growth Partner Policies
-- growth_partners
CREATE POLICY "Partners can view their own profile" ON growth_partners FOR SELECT TO authenticated USING (
  auth_user_id = (select auth.uid())
);
CREATE POLICY "Partners can update their own profile" ON growth_partners FOR UPDATE TO authenticated
  USING (auth_user_id = (select auth.uid()))
  WITH CHECK (auth_user_id = (select auth.uid()));

-- doctor_leads (Combined Partner & Employee access policy to avoid multiple permissive warnings)
CREATE POLICY "Authorized staff can manage leads" ON doctor_leads FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM growth_partners WHERE id = doctor_leads.assigned_to AND auth_user_id = (select auth.uid()))
  OR EXISTS (SELECT 1 FROM employees WHERE (id = doctor_leads.assigned_employee_id OR id = doctor_leads.assigned_manager_id) AND auth_user_id = (select auth.uid()))
);

-- lead_activities
CREATE POLICY "Partners can manage their lead activities" ON lead_activities FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM growth_partners WHERE id = lead_activities.partner_id AND auth_user_id = (select auth.uid()))
);

-- commission_payouts
CREATE POLICY "Partners can view their payouts" ON commission_payouts FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM growth_partners WHERE id = commission_payouts.partner_id AND auth_user_id = (select auth.uid()))
);

-- 8. Employee Policies
-- employees
CREATE POLICY "Employees can view their profile" ON employees FOR SELECT TO authenticated USING (
  auth_user_id = (select auth.uid())
);
CREATE POLICY "Employees can update their profile" ON employees FOR UPDATE TO authenticated
  USING (auth_user_id = (select auth.uid()))
  WITH CHECK (auth_user_id = (select auth.uid()));

-- employee_activities
CREATE POLICY "Employees can manage their activities" ON employee_activities FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM employees WHERE id = employee_activities.employee_id AND auth_user_id = (select auth.uid()))
);

-- 9. Realtime Publications
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE appointments;
COMMIT;
