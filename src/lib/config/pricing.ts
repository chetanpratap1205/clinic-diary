export const PRICING_PLANS = {
  quarterly: {
    id: "quarterly",
    name: "Quarterly",
    price: "₹1,499",
    basePrice: 1499,
    duration: "per 3 months",
    shortDuration: "/ 3 months",
    description: "Perfect for getting started and testing the waters.",
    features: [
      "One Complete Product",
      "Unlimited Patients & Appointments",
      "Free Premium Starter Kit",
      "Smart WhatsApp & SMS Ready",
      "Executive Analytics",
    ],
    popular: false,
  },
  yearly: {
    id: "yearly",
    name: "Annual",
    price: "₹4,999",
    basePrice: 4999,
    duration: "per year",
    shortDuration: "/ 12 months",
    description: "Maximum ROI for established clinics.",
    features: [
      "Everything in Quarterly",
      "Dedicated Account Manager",
      "Priority Support Channel",
      "Annual Performance Reviews",
    ],
    popular: true,
  },
} as const;

export type PlanId = keyof typeof PRICING_PLANS;
