import type { ReactNode } from "react";

/**
 * Layout for /partner/* routes.
 * - /partner       → redirects to /partner/login (handled in page.tsx)
 * - /partner/login → Partner Login page (public, no auth required)
 *
 * This layout intentionally does NO redirect — each child page
 * handles its own navigation logic. The old blanket redirect to
 * /field-portal has been removed so that /partner/login can render.
 */
export default function PartnerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
