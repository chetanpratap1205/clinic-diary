export interface SpecialtyExample {
  id: string;
  label: string;
  accentColor: string;
  doctorName: string;
  clinicName: string;
  clinicTagline: string;
  reactivationMessage: string;
}

export const specialties: SpecialtyExample[] = [
  {
    id: 'general',
    label: 'General & Cardiology',
    accentColor: '#10b981', // emerald-500
    doctorName: 'Dr. Ananya Verma',
    clinicName: 'Verma Heart & Wellness Clinic',
    clinicTagline: 'Premium Cardiac Care',
    reactivationMessage: "Hi Rohan, it's been a while since your last visit. Reply 'BOOK' to secure a priority slot this week."
  },
  {
    id: 'dermatology',
    label: 'Dermatology & Aesthetics',
    accentColor: '#ec4899', // pink-500
    doctorName: 'Dr. Rehan Kapoor',
    clinicName: 'Kapoor Skin & Aesthetics',
    clinicTagline: 'Modern Skin Care',
    reactivationMessage: "Hi Priya, it's time for your next skin treatment follow-up. Reply 'BOOK' to lock in your preferred slot."
  },
  {
    id: 'psychiatry',
    label: 'Psychiatry & Mental Health',
    accentColor: '#8b5cf6', // violet-500
    doctorName: 'Dr. Meera Nair',
    clinicName: 'Nair Mind Care',
    clinicTagline: 'Confidential Mental Wellness',
    reactivationMessage: "Hi Arjun, your next session is due. Reply 'BOOK' to schedule at a time that works best for you."
  },
  {
    id: 'dental',
    label: 'Dental & Orthopedics',
    accentColor: '#3b82f6', // blue-500
    doctorName: 'Dr. Karan Mehta',
    clinicName: 'Mehta Dental & Ortho',
    clinicTagline: 'Precision Dental Care',
    reactivationMessage: "Hi Sneha, your routine cleaning is due this month. Reply 'BOOK' to grab a convenient slot."
  }
];
