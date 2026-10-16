import type { Metadata } from "next";
import { MedysevaPitchClient } from "./medyseva-pitch-client";

export const metadata: Metadata = {
  title: "Confidential Strategic Proposal | Medyseva & Vishesh Hospital",
  description: "Private executive acquisition and tertiary hospital IPD funnel proposal for Dr. Vishesh Kasliwal.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MedysevaPitchPage() {
  return <MedysevaPitchClient />;
}
