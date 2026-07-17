import { redirect } from "next/navigation";

/**
 * Old /partner route → redirect to partner login page.
 * Partners who have bookmarks or old links will land on their dedicated login.
 * From there they can sign in and reach /field-portal.
 */
export default function PartnerRootPage() {
  redirect("/partner/login");
}
