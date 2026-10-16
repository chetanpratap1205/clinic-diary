import type { Metadata } from "next";
import { NotionPharmaPitchClient } from "./notion-pharma-pitch-client";

export const metadata: Metadata = {
  title: "Confidential Strategic Proposal | Notion Pharma & Nandani Labs",
  description: "Private executive acquisition and territory distribution proposal for Shantanu Kharia.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotionPharmaPitchPage() {
  return <NotionPharmaPitchClient />;
}
