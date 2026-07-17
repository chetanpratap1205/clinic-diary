import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { growthPartners } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.user) {
      // ── Smart role-based routing ─────────────────────────────────────
      // After email verification, check if this user is a Growth Partner.
      // If yes → always send them to /field-portal (their portal).
      // If no  → respect the `next` param (e.g. /onboarding for doctors).
      let redirectPath = next

      // Let explicit update-password requests through
      if (next === '/update-password' || next === '/reset-password') {
        redirectPath = next
      } else {
        try {
          const [partnerRecord] = await db
            .select({ id: growthPartners.id, isActive: growthPartners.isActive })
            .from(growthPartners)
            .where(eq(growthPartners.authUserId, data.user.id))
            .limit(1)

          if (partnerRecord) {
            // This is a field partner — always route to their portal
            redirectPath = '/field-portal'
          }
        } catch {
          // If DB check fails, fall through to `next` param as-is
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }
    }
  }

  // Return user to appropriate error page based on flow type
  // Partner flows (next=/field-portal*) → field portal login
  // Doctor flows → doctor login
  const isPartnerFlow = next?.startsWith('/field-portal') || next?.startsWith('/partner')
  const errorRedirect = isPartnerFlow
    ? `${origin}/field-portal/login?error=Could not verify email`
    : `${origin}/login?error=Could not verify email`
  return NextResponse.redirect(errorRedirect)
}
