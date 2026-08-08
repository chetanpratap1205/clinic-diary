import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { growthPartners, employees } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // Helper: resolve final redirect URL accounting for reverse-proxied hosts
  function buildRedirect(path: string) {
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocal = process.env.NODE_ENV === 'development'
    if (isLocal) return `${origin}${path}`
    if (forwardedHost) return `https://${forwardedHost}${path}`
    return `${origin}${path}`
  }

  if (!code) {
    // No code — invalid or expired link
    return NextResponse.redirect(buildRedirect('/login?error=link_invalid'))
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data?.user) {
    console.error('[auth/callback] exchangeCodeForSession error:', error?.message)
    return NextResponse.redirect(buildRedirect('/login?error=link_expired'))
  }

  // ── Password reset flow ───────────────────────────────────────────────────
  // When a doctor clicks the "Reset Password" email link, Supabase sends
  // type=recovery. We must forward them to /update-password so they can set
  // a new password within the active session.
  if (next === '/update-password' || next === '/reset-password') {
    return NextResponse.redirect(buildRedirect('/update-password'))
  }

  // ── Role-based redirect for email confirmation ────────────────────────────
  try {
    // Check if this is an internal employee
    const [empRecord] = await db
      .select({ id: employees.id, role: employees.role, isActive: employees.isActive })
      .from(employees)
      .where(and(eq(employees.authUserId, data.user.id), eq(employees.isActive, true)))
      .limit(1)

    if (empRecord) {
      const empPath = (empRecord.role === 'super_admin' || empRecord.role === 'area_manager')
        ? '/admin'
        : '/employee'
      return NextResponse.redirect(buildRedirect(empPath))
    }

    // Check growth partners
    const [partnerRecord] = await db
      .select({ id: growthPartners.id, isActive: growthPartners.isActive })
      .from(growthPartners)
      .where(eq(growthPartners.authUserId, data.user.id))
      .limit(1)

    if (partnerRecord?.isActive) {
      return NextResponse.redirect(buildRedirect('/field-portal'))
    }
  } catch (err) {
    console.error('[auth/callback] role lookup error:', err)
  }

  // ── Default: follow the `next` param (e.g. /onboarding for new signups) ──
  return NextResponse.redirect(buildRedirect(next))
}
