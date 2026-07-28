import type { Metadata } from "next";
import { DemoPageClient } from "./demo-client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in";

export const metadata: Metadata = {
  title: "Watch 2-Min Product Demo | Doctor Diary - Smart Clinic Software",
  description:
    "Watch a 2-minute walkthrough of Doctor Diary. See how new-age doctors across all medical specialties (Psychiatry, Dentistry, Dermatology, Pediatrics, OPD & Super-specialties) eliminate patient no-shows, write AI e-prescriptions, and automate WhatsApp scheduling.",
  keywords: [
    "doctor diary product demo",
    "clinic management software walkthrough",
    "patient appointment booking demo video",
    "WhatsApp clinic automation demo",
    "psychiatry clinic management software demo",
    "dental software demo India",
    "dermatology clinic software demo",
    "pediatric EMR software demo",
    "OPD prescription writer demo",
    "how to reduce patient no-shows video"
  ],
  alternates: {
    canonical: `${BASE_URL}/demo`,
  },
  openGraph: {
    title: "Watch 2-Min Product Demo | Doctor Diary - Smart Clinic Software",
    description:
      "Automate 24/7 WhatsApp scheduling, AI e-prescriptions & 5-star Google reviews. Built universally for all medical & health specialties in India.",
    url: `${BASE_URL}/demo`,
    siteName: "Doctor Diary",
    images: [
      {
        url: `${BASE_URL}/api/og?title=2-Min%20Product%20Demo`,
        width: 1200,
        height: 630,
        alt: "Doctor Diary Product Walkthrough Demo",
      },
    ],
    type: "video.other",
  },
  twitter: {
    card: "summary_large_image",
    title: "Watch 2-Min Product Demo | Doctor Diary",
    description:
      "See how 1,200+ new-age doctors in India zero out patient no-shows and automate WhatsApp clinic growth.",
    images: [`${BASE_URL}/api/og?title=2-Min%20Product%20Demo`],
  },
};

export default function DemoPage() {
  // JSON-LD Schemas for VideoObject, SoftwareApplication, and FAQPage (SEO Rich Snippets)
  const videoObjectSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "Doctor Diary 2-Minute Product Demo Walkthrough",
    "description": "Watch how Doctor Diary automates patient scheduling, 2-way WhatsApp reminders, AI e-prescriptions, and 5-star Google reviews for all medical specialties.",
    "thumbnailUrl": [`${BASE_URL}/icon-512.png`],
    "uploadDate": "2026-01-15T08:00:00+05:30",
    "duration": "PT2M",
    "contentUrl": `${BASE_URL}/demo_video.mp4`,
    "embedUrl": `${BASE_URL}/demo`,
    "publisher": {
      "@type": "Organization",
      "name": "Doctor Diary by NatureXpress",
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/icon-192.png`
      }
    }
  };

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Doctor Diary",
    "operatingSystem": "Web, iOS, Android, iPadOS",
    "applicationCategory": "MedicalApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1250"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is Doctor Diary suitable for my specific domain (Psychiatry, Dental, Skin, General OPD)?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Doctor Diary is built universally for all medical and healthcare domains including Psychiatry, Dentistry, Dermatology, Pediatrics, Orthopedics, Cardiology, Ophthalmology, General OPD, and AYUSH."
        }
      },
      {
        "@type": "Question",
        "name": "Why is the demo video muted by default?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Modern web browsers block autoplay videos with sound. We default to muted autoplay so the video starts instantly without browser blocking. Simply tap the overlay sound button to enable audio."
        }
      },
      {
        "@type": "Question",
        "name": "How fast can I setup Doctor Diary in my clinic?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Setup takes under 5 minutes with zero software installation required."
        }
      }
    ]
  };

  return (
    <>
      {/* Inject SEO JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoObjectSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <DemoPageClient />
    </>
  );
}
