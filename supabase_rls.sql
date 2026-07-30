-- 1. Enable RLS on all tables
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
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE unclaimed_clinics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts if re-running
DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename); 
    END LOOP; 
END $$;

-- 2. Public Read Policies
CREATE POLICY "Public clinics are viewable by everyone" ON clinics FOR SELECT USING (true);
CREATE POLICY "Public availability is viewable by everyone" ON availability FOR SELECT USING (true);
CREATE POLICY "Public availability overrides are viewable by everyone" ON availability_overrides FOR SELECT USING (true);
CREATE POLICY "Public can view gallery" ON clinic_gallery FOR SELECT USING (true);
CREATE POLICY "Public can view services" ON clinic_services FOR SELECT USING (true);
CREATE POLICY "Public can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Public can view unclaimed clinics" ON unclaimed_clinics FOR SELECT USING (true);
CREATE POLICY "Anyone can view qr_codes" ON qr_codes FOR SELECT USING (true);
CREATE POLICY "Public can view reviews" ON reviews FOR SELECT USING (true);

-- 3. Public Insert Policies
CREATE POLICY "Anyone can create an appointment" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can submit a review" ON reviews FOR INSERT WITH CHECK (true);

-- 4. Clinic Admin Policies
-- clinics
CREATE POLICY "Admins can update their own clinics" ON clinics FOR UPDATE USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = id AND auth_user_id = (select auth.uid()))
);

-- availability
CREATE POLICY "Admins can insert availability" ON availability FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = availability.clinic_id AND auth_user_id = (select auth.uid()))
);
CREATE POLICY "Admins can update availability" ON availability FOR UPDATE USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = availability.clinic_id AND auth_user_id = (select auth.uid()))
);
CREATE POLICY "Admins can delete availability" ON availability FOR DELETE USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = availability.clinic_id AND auth_user_id = (select auth.uid()))
);

-- availability_overrides
CREATE POLICY "Admins can insert overrides" ON availability_overrides FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = availability_overrides.clinic_id AND auth_user_id = (select auth.uid()))
);
CREATE POLICY "Admins can update overrides" ON availability_overrides FOR UPDATE USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = availability_overrides.clinic_id AND auth_user_id = (select auth.uid()))
);
CREATE POLICY "Admins can delete overrides" ON availability_overrides FOR DELETE USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = availability_overrides.clinic_id AND auth_user_id = (select auth.uid()))
);

-- appointments (Read, Update, Delete for Admins)
CREATE POLICY "Admins can view their appointments" ON appointments FOR SELECT USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = appointments.clinic_id AND auth_user_id = (select auth.uid()))
);
CREATE POLICY "Admins can update their appointments" ON appointments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = appointments.clinic_id AND auth_user_id = (select auth.uid()))
);
CREATE POLICY "Admins can delete their appointments" ON appointments FOR DELETE USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = appointments.clinic_id AND auth_user_id = (select auth.uid()))
);

-- patients
CREATE POLICY "Admins can manage patients" ON patients FOR ALL USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = patients.clinic_id AND auth_user_id = (select auth.uid()))
);

-- follow_ups
CREATE POLICY "Admins can manage follow ups" ON follow_ups FOR ALL USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = follow_ups.clinic_id AND auth_user_id = (select auth.uid()))
);

-- visit_notes
CREATE POLICY "Admins can manage visit notes" ON visit_notes FOR ALL USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = visit_notes.clinic_id AND auth_user_id = (select auth.uid()))
);

-- subscriptions
CREATE POLICY "Admins can view subscriptions" ON subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = subscriptions.clinic_id AND auth_user_id = (select auth.uid()))
);

-- payment_logs
CREATE POLICY "Admins can view payment_logs" ON payment_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = payment_logs.clinic_id AND auth_user_id = (select auth.uid()))
);

-- reminder_logs
CREATE POLICY "Admins can view their reminder logs" ON reminder_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM appointments 
    JOIN clinic_admins ON appointments.clinic_id = clinic_admins.clinic_id
    WHERE appointments.id = reminder_logs.appointment_id AND clinic_admins.auth_user_id = (select auth.uid())
  )
);

-- clinic_admins (Admin can only see themselves/their clinic's admins)
CREATE POLICY "Admins can view their clinic admins" ON clinic_admins FOR SELECT USING (
  auth_user_id = (select auth.uid())
);

-- reviews
CREATE POLICY "Admins can manage reviews" ON reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = reviews.clinic_id AND auth_user_id = (select auth.uid()))
);

-- orders
CREATE POLICY "Admins can manage orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = orders.clinic_id AND auth_user_id = (select auth.uid()))
);

-- order_items
CREATE POLICY "Admins can manage order items" ON order_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM orders
    JOIN clinic_admins ON orders.clinic_id = clinic_admins.clinic_id
    WHERE orders.id = order_items.order_id AND clinic_admins.auth_user_id = (select auth.uid())
  )
);

-- clinic_services
CREATE POLICY "Admins can manage clinic services" ON clinic_services FOR ALL USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = clinic_services.clinic_id AND auth_user_id = (select auth.uid()))
);

-- clinic_gallery
CREATE POLICY "Admins can manage clinic gallery" ON clinic_gallery FOR ALL USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = clinic_gallery.clinic_id AND auth_user_id = (select auth.uid()))
);

-- qr_codes
CREATE POLICY "Admins can manage qr codes" ON qr_codes FOR ALL USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = qr_codes.clinic_id AND auth_user_id = (select auth.uid()))
);

-- 5. Growth Partner Policies
-- growth_partners
CREATE POLICY "Partners can view their own profile" ON growth_partners FOR SELECT USING (
  auth_user_id = (select auth.uid())
);
CREATE POLICY "Partners can update their own profile" ON growth_partners FOR UPDATE USING (
  auth_user_id = (select auth.uid())
);

-- doctor_leads
CREATE POLICY "Partners can manage their leads" ON doctor_leads FOR ALL USING (
  EXISTS (SELECT 1 FROM growth_partners WHERE id = doctor_leads.assigned_to AND auth_user_id = (select auth.uid()))
);

-- lead_activities
CREATE POLICY "Partners can manage their lead activities" ON lead_activities FOR ALL USING (
  EXISTS (SELECT 1 FROM growth_partners WHERE id = lead_activities.partner_id AND auth_user_id = (select auth.uid()))
);

-- commission_payouts
CREATE POLICY "Partners can view their payouts" ON commission_payouts FOR SELECT USING (
  EXISTS (SELECT 1 FROM growth_partners WHERE id = commission_payouts.partner_id AND auth_user_id = (select auth.uid()))
);

-- 6. Realtime Publications
-- Add appointments to supabase_realtime publication to enable client-side live updates (e.g. queue view)
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE appointments;
COMMIT;
