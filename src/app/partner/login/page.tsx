import { redirect } from "next/navigation";

/**
 * /partner/login is deprecated.
 * The canonical field partner login URL is /field-portal/login.
 * This redirect ensures old bookmarks and links still work.
 */
export default function PartnerLoginPage() {
  redirect("/field-portal/login");
}
