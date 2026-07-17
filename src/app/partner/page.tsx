import { redirect } from "next/navigation";

/**
 * /partner root → redirect to the canonical field partner login.
 */
export default function PartnerRootPage() {
  redirect("/field-portal/login");
}
