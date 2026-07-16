import { redirect } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Backwards compatibility redirect for the old /partner route.
 * ALL /partner/* sub-routes redirect to /field-portal/*
 */
export default function PartnerLegacyLayout({
  children,
}: {
  children: ReactNode;
}) {
  redirect("/field-portal");
}
