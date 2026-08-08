import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // Check if a user's logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase.auth.signOut()
  }

  revalidatePath('/', 'layout')

  // Redirect to staff-login if they came from staff area, otherwise standard login
  const referer = req.headers.get('referer')
  
  if (referer && (referer.includes('/employee') || referer.includes('/admin') || referer.includes('/staff-login'))) {
    return NextResponse.redirect(new URL('/staff-login', req.url), {
      status: 302,
    })
  }

  return NextResponse.redirect(new URL('/login', req.url), {
    status: 302,
  })
}
