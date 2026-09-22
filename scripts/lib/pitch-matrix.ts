export interface LeadAuditResult {
  clinicName: string;
  doctorName: string;
  city: string;
  country: string;
  phone: string;
  whatsappLink: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  websiteUrl: string | null;
  hasWebsite: boolean;
  hasOnlineBooking: boolean;
  instagramHandle: string | null;
  isInstaActive: boolean;
  hasMetaAds: boolean;
  clinicSlug?: string;
}

export interface PitchResult {
  primaryPainPoint: string;
  whatsappScript: string;
  coldCallHook: string;
  objectionHandling: Record<string, string>;
}

export function generatePitch(lead: LeadAuditResult): PitchResult {
  const isUAE = lead.country.toLowerCase().includes('uae') || lead.city.toLowerCase().includes('dubai') || lead.city.toLowerCase().includes('abudhabi') || lead.phone.startsWith('+971');

  let primaryPainPoint = '';
  let whatsappScript = '';
  let coldCallHook = '';

  const docLabel = lead.doctorName && lead.doctorName.toLowerCase() !== 'unknown doctor' 
    ? `Dr. ${lead.doctorName.replace(/^dr\.?\s*/i, '')}`
    : `Doctor`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://doctor.naturexpress.in';
  const clinicSlug = lead.clinicSlug || `${(lead.clinicName || lead.doctorName || 'clinic').toLowerCase().replace(/^dr\.?\s*/i, '').replace(/[^a-z0-9]/g, '-')}-${lead.city.toLowerCase()}`.slice(0, 45);
  const demoUrl = `${baseUrl}/clinic/${clinicSlug}`;

  // Rule 1: Strictly Verified Active Meta Ads
  if (lead.hasMetaAds && !lead.hasOnlineBooking) {
    primaryPainPoint = 'Wasting Meta Ad spend sending leads to manual WhatsApp DMs without direct booking page';
    whatsappScript = `Hi ${docLabel}, noticed your active Instagram ads for ${lead.clinicName}! 👋\n\nAre your staff manually replying to DMs to confirm slots? We helped top ${lead.specialty} clinics convert 35% more ad clicks into paid consultations using a 24/7 instant booking page + live queue tracker.\n\nTake a quick 30-sec look at a sample clinic layout built for you here: ${demoUrl}\n\nWould love to set up your clinic page today!`;
    coldCallHook = `"Hi ${docLabel}, calling from Doctor Diary. I noticed you're running Instagram ads for ${lead.clinicName}, but prospective patients have to wait for manual WhatsApp replies. How many ad leads drop off before booking a slot?"`;
  } 
  // Rule 2: High Google Reviews (4.2+ & 25+ reviews) + No Website/Booking Page
  else if (lead.rating >= 4.2 && lead.reviewCount >= 25 && (!lead.hasWebsite || !lead.hasOnlineBooking)) {
    primaryPainPoint = 'High Google reputation but losing after-hours / weekend bookings to competitors';
    whatsappScript = `Hi ${docLabel}, congratulations on your impressive ${lead.rating}★ rating (${lead.reviewCount}+ reviews) on Google for ${lead.clinicName}! 🎉\n\nHowever, when patients search after 8 PM or on weekends, they can't book an appointment directly without calling your front desk. We created a zero-friction booking & live queue tracking page for clinics like yours.\n\nCheck how easy it is for patients: ${demoUrl}\n\nCan I hand over your customized clinic page setup this week?`;
    coldCallHook = `"Hi ${docLabel}, congrats on your ${lead.rating}-star Google rating! Quick question—how do you capture patient appointments when your front desk is closed after hours?"`;
  }
  // Rule 3: Pediatrician / Long Queue Specialty
  else if (lead.specialty.toLowerCase().includes('pediatric') || lead.specialty.toLowerCase().includes('child') || lead.specialty.toLowerCase().includes('gynaec') || lead.specialty.toLowerCase().includes('ortho')) {
    primaryPainPoint = 'Waiting room overcrowding & parent/patient frustration during long queue delays';
    whatsappScript = `Hi ${docLabel}, we know how hectic waiting rooms get at ${lead.clinicName} during peak hours! 🏥\n\nWith Doctor Diary, your patients get a live digital token on their phone so they can wait comfortably in their car or home until their turn is 2 calls away. No waiting room chaos!\n\nSee how live queue tracking works in 30 seconds: ${demoUrl}\n\nWould you like a free 7-day trial for your clinic?`;
    coldCallHook = `"Hi ${docLabel}, calling from Doctor Diary. Parents and patients hate waiting 45 minutes in crowded waiting rooms. How are you currently managing peak-hour token queues at ${lead.clinicName}?"`;
  }
  // Rule 4: Active Instagram + Low Booking Friction
  else if (lead.instagramHandle && lead.isInstaActive && !lead.hasOnlineBooking) {
    primaryPainPoint = 'Active Instagram following not converting efficiently into direct appointments';
    whatsappScript = `Hi ${docLabel}, love the content on your Instagram page (@${lead.instagramHandle})! 📸\n\nInstead of putting a plain WhatsApp number in your bio, adding an instant 1-click booking link allows your followers to book sittings 24/7 directly.\n\nSee sample clinic booking page: ${demoUrl}\n\nShall we connect your clinic's booking link today?`;
    coldCallHook = `"Hi ${docLabel}, saw your active Instagram page! You're creating great content, but how many followers are actually converting into booked consultations via your bio link?"`;
  }
  // Rule 5: Generic Baseline Pitch (DEFAULT SAFE INTRO)
  else {
    primaryPainPoint = 'Manual reception booking & no PWA app install for repeat patient retention';
    whatsappScript = `Hi ${docLabel}, hope you are doing well!\n\nWe built Doctor Diary—a zero-friction clinic management platform that gives ${lead.clinicName || 'your clinic'} an instant booking page, live queue tracking, and prescription generator.\n\nCheck out your clinic's 30-second live demo page: ${demoUrl}\n\nWould love to set up your clinic page in 5 minutes!`;
    coldCallHook = `"Hi ${docLabel}, calling from Doctor Diary. We help ${lead.specialty} clinics automate appointment booking and live token queues. Do you currently use a digital queue tracker at ${lead.clinicName}?"`;
  }

  const objectionHandling: Record<string, string> = {
    'We already use Practo / another software': 
      'Practo costs ₹15,000+ per year and lists your competitors right next to your profile. Doctor Diary is your OWN private clinic portal with zero competitor ads.',
    'My patients prefer calling receptionist':
      'Doctor Diary doesn\'t replace your receptionist! Your receptionist gets a 1-click dashboard to issue tokens, while tech-savvy patients book directly 24/7.',
    'Is it expensive?':
      isUAE 
        ? 'Not at all! Our plan starts at just $29/month (or $79/quarter) with a 7-day free trial. One extra consultation pays for the entire software.'
        : 'Not at all! Our starter plan is just ₹2,999 for 3 full months with a zero-risk 7-day trial. 2-3 extra consultations cover the entire cost.',
  };

  return {
    primaryPainPoint,
    whatsappScript,
    coldCallHook,
    objectionHandling,
  };
}
