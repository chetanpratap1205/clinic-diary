export type ClinicState = {
  lifetimeAppointments: number;
  todayAppointments: number;
  weekAppointments: number;
  overdueFollowUps: number;
  subscriptionDaysLeft: number | null;
  isSubscriptionActive: boolean;
  currentHour: number;
  doctorName: string;
  clinicSlug: string;
  clinicPhone?: string; // Optional if needed for whatsapp
};

export type InsightBanner = {
  id: string;
  variant: "success" | "warning" | "info" | "purple" | "default";
  title: string;
  message: string;
  actionText?: string;
  actionType?: "copy_link" | "link" | "none" | "whatsapp" | "download_qr";
  actionUrl?: string;
};

export function getDashboardInsight(state: ClinicState): InsightBanner {
  const {
    lifetimeAppointments,
    todayAppointments,
    weekAppointments,
    overdueFollowUps,
    subscriptionDaysLeft,
    isSubscriptionActive,
    currentHour,
    doctorName,
    clinicSlug,
  } = state;

  const bookingUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in"}/book/${clinicSlug}`;

  // Rule 1: Highest Priority - Retention / Subscription expiring soon
  if (isSubscriptionActive && subscriptionDaysLeft !== null && subscriptionDaysLeft <= 5 && subscriptionDaysLeft >= 0) {
    return {
      id: "retention_warning",
      variant: "warning",
      title: "Subscription Expiring Soon",
      message: `Your plan expires in ${subscriptionDaysLeft === 0 ? "today" : `${subscriptionDaysLeft} days`}. Renew now to keep your automated reminders and queue management running smoothly.`,
      actionText: "Renew Plan",
      actionType: "link",
      actionUrl: "/dashboard/settings/billing",
    };
  }

  // Rule 2: Onboarding - Brand new clinic
  if (lifetimeAppointments < 5) {
    const whatsappText = encodeURIComponent(`Book your appointment with Dr. ${doctorName} online:\n${bookingUrl}`);
    return {
      id: "onboarding",
      variant: "info",
      title: "Concierge Setup Complete",
      message: "Your digital clinic is live. Share your booking link below to start taking 0% commission appointments.",
      actionText: "Share on WhatsApp",
      actionType: "whatsapp",
      actionUrl: `https://wa.me/?text=${whatsappText}`,
    };
  }

  // Rule 3: Revenue Recovery - High Overdue Follow-ups
  if (overdueFollowUps > 5) {
    return {
      id: "revenue_recovery",
      variant: "warning",
      title: "Action Required: Overdue Follow-ups",
      message: `You have ${overdueFollowUps} overdue follow-ups. Re-engaging these patients could recover significant revenue. Send them a quick reminder.`,
      actionText: "View Follow-ups",
      actionType: "link",
      actionUrl: "/dashboard/follow-ups",
    };
  }

  // Rule 4: Daily Prep - Morning (Before 12 PM) with appointments
  if (currentHour < 12 && todayAppointments > 0) {
    return {
      id: "morning_prep",
      variant: "success",
      title: "Good Morning!",
      message: `You have ${todayAppointments} appointments scheduled for today. Have a great day ahead!`,
      actionText: "View Queue",
      actionType: "link",
      actionUrl: "/dashboard/queue",
    };
  }

  // Rule 5: Evening Wrap-up (After 5 PM)
  if (currentHour >= 17 && todayAppointments > 0) {
    return {
      id: "evening_wrapup",
      variant: "purple",
      title: "Great Work Today!",
      message: `You managed ${todayAppointments} appointments today. Excellent work providing care.`,
      actionType: "none",
    };
  }

  // Rule 6: Value Realization - High volume this week
  if (weekAppointments > 20) {
    const hoursSaved = Math.floor((weekAppointments * 3) / 60);
    const minutesSaved = (weekAppointments * 3) % 60;
    const timeStr = hoursSaved > 0 
      ? `${hoursSaved} hr ${minutesSaved > 0 ? `${minutesSaved} min` : ''}`.trim()
      : `${minutesSaved} min`;

    return {
      id: "value_realization",
      variant: "success",
      title: "Weekly Value Report",
      message: `Doctor Diary handled ${weekAppointments} bookings this week, saving your clinic approximately ${timeStr} of manual work.`,
      actionType: "none",
    };
  }

  // Rule 7: Idle Clinic - Low volume this week but not a new user
  if (weekAppointments === 0) {
    return {
      id: "idle_clinic",
      variant: "default",
      title: "Things are a bit quiet",
      message: "Boost walk-ins by ensuring your QR code is visible at the reception desk.",
      actionText: "Download QR Code",
      actionType: "link", // Usually a link to the QR page where they can download it
      actionUrl: "/dashboard/qr",
    };
  }

  // Fallback Rule: Just a clean, general state
  return {
    id: "general_active",
    variant: "info",
    title: "Dashboard Active",
    message: "Your clinic is running smoothly. Share your booking link to keep the queue filled.",
    actionText: "Copy Booking Link",
    actionType: "copy_link",
    actionUrl: bookingUrl,
  };
}
