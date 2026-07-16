import { redirect } from "next/navigation";

/**
 * Backwards compatibility redirect.
 * Old route /partner → /field-portal
 * Partners who have bookmarks or old links will be automatically redirected.
 */
export default function PartnerRedirectPage() {
  redirect("/field-portal");
}
