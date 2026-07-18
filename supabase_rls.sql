-- 1. Enable RLS on all tables
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. Public Read Policies
-- Anyone can see clinics, their availability, and overrides to book an appointment
CREATE POLICY "Public clinics are viewable by everyone" ON clinics FOR SELECT USING (true);
CREATE POLICY "Public availability is viewable by everyone" ON availability FOR SELECT USING (true);
CREATE POLICY "Public availability overrides are viewable by everyone" ON availability_overrides FOR SELECT USING (true);

-- 3. Public Insert Policies
-- Anyone can create an appointment (booking page)
-- Note: In production, consider adding a captcha or token-based validation to prevent spam.
CREATE POLICY "Anyone can create an appointment" ON appointments FOR INSERT WITH CHECK (true);

-- 4. Clinic Admin Policies
-- Admins can only see and manage data for their own clinic
-- We check if the auth.uid() exists in clinic_admins for the given clinicId

-- clinics
CREATE POLICY "Admins can update their own clinics" ON clinics FOR UPDATE USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = id AND auth_user_id = auth.uid())
);

-- availability
CREATE POLICY "Admins can insert availability" ON availability FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = availability.clinic_id AND auth_user_id = auth.uid())
);
CREATE POLICY "Admins can update availability" ON availability FOR UPDATE USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = availability.clinic_id AND auth_user_id = auth.uid())
);
CREATE POLICY "Admins can delete availability" ON availability FOR DELETE USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = availability.clinic_id AND auth_user_id = auth.uid())
);

-- availability_overrides
CREATE POLICY "Admins can insert overrides" ON availability_overrides FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = availability_overrides.clinic_id AND auth_user_id = auth.uid())
);
CREATE POLICY "Admins can update overrides" ON availability_overrides FOR UPDATE USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = availability_overrides.clinic_id AND auth_user_id = auth.uid())
);
CREATE POLICY "Admins can delete overrides" ON availability_overrides FOR DELETE USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = availability_overrides.clinic_id AND auth_user_id = auth.uid())
);

-- appointments (Read, Update, Delete for Admins)
CREATE POLICY "Admins can view their appointments" ON appointments FOR SELECT USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = appointments.clinic_id AND auth_user_id = auth.uid())
);
CREATE POLICY "Admins can update their appointments" ON appointments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = appointments.clinic_id AND auth_user_id = auth.uid())
);
CREATE POLICY "Admins can delete their appointments" ON appointments FOR DELETE USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = appointments.clinic_id AND auth_user_id = auth.uid())
);

-- patients
CREATE POLICY "Admins can manage patients" ON patients FOR ALL USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = patients.clinic_id AND auth_user_id = auth.uid())
);

-- follow_ups
CREATE POLICY "Admins can manage follow ups" ON follow_ups FOR ALL USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = follow_ups.clinic_id AND auth_user_id = auth.uid())
);

-- visit_notes
CREATE POLICY "Admins can manage visit notes" ON visit_notes FOR ALL USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = visit_notes.clinic_id AND auth_user_id = auth.uid())
);

-- subscriptions
CREATE POLICY "Admins can view subscriptions" ON subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM clinic_admins WHERE clinic_id = subscriptions.clinic_id AND auth_user_id = auth.uid())
);

-- reminder_logs
CREATE POLICY "Admins can view their reminder logs" ON reminder_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM appointments 
    JOIN clinic_admins ON appointments.clinic_id = clinic_admins.clinic_id
    WHERE appointments.id = reminder_logs.appointment_id AND clinic_admins.auth_user_id = auth.uid()
  )
);

-- clinic_admins (Admin can only see themselves/their clinic's admins)
CREATE POLICY "Admins can view their clinic admins" ON clinic_admins FOR SELECT USING (
  auth_user_id = auth.uid()
);

-- 5. Realtime Publications
-- Add appointments to supabase_realtime publication to enable client-side live updates (e.g. queue view)
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE appointments;
COMMIT;
