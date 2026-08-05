import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { growthPartners, employees } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.user) {
      let redirectPath = next

      if (next === '/update-password' || next === '/reset-password') {
        redirectPath = next
      } else {
        try {
          // Check internal employees first
          const [empRecord] = await db
            .select({ id: employees.id, role: employees.role, isActive: employees.isActive })
            .from(employees)
            .where(and(eq(employees.authUserId, data.user.id), eq(employees.isActive, true)))
            .limit(1)

          if (empRecord) {
            redirectPath = (empRecord.role === "super_admin" || empRecord.role === "area_manager") ? "/admin" : "/employee"
          } else {
            // Check growth partners
            const [partnerRecord] = await db
              .select({ id: growthPartners.id, isActive: growthPartners.isActive })
              .from(growthPartners)
              .where(eq(growthPartners.authUserId, data.user.id))
              .limit(1)

            if (partnerRecord && partnerRecord.isActive) {
              redirectPath = '/field-portal'
            }
          }
        } catch (err) {
          console.error("Auth callback role lookup error:", err)
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

  const isPartnerFlow = next?.startsWith('/field-portal') || next?.startsWith('/partner')
  const errorRedirect = isPartnerFlow
    ? `${origin}/field-portal/login?error=Could not verify email`
    : `${origin}/login?error=Could not verify email`
  return NextResponse.redirect(errorRedirect)
}
