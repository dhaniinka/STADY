import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)

    // Get the intended redirect URL or default to role-select
    const redirectTo = requestUrl.searchParams.get("next") || "/role-select"

    // Redirect to the intended page
    return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
  }

  // If no code is present, redirect to the login page
  return NextResponse.redirect(new URL("/login", request.url))
}