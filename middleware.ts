import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createMiddlewareClient({ req, res })

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/auth/callback",
  ]
  const isPublicRoute = publicRoutes.some(
    (route) => req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(route),
  )

  if (!session && !isPublicRoute) {
    if (req.nextUrl.pathname === "/role-select") {
      const redirectUrl = req.nextUrl.clone()
      const searchParams = new URLSearchParams(redirectUrl.search)
      const newUser = searchParams.get("new")

      if (newUser === "true") {
        return res
      }
    }

    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (session && req.nextUrl.pathname.startsWith("/teacher/")) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (!profile || profile.role !== "teacher") {
        return NextResponse.redirect(new URL("/role-select", req.url))
      }
    } catch (error) {
      console.error("Error checking user role:", error)
      return NextResponse.redirect(new URL("/role-select", req.url))
    }
  }

  if (session && req.nextUrl.pathname.startsWith("/student/")) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (!profile || profile.role !== "student") {
        return NextResponse.redirect(new URL("/role-select", req.url))
      }
    } catch (error) {
      console.error("Error checking user role:", error)
      return NextResponse.redirect(new URL("/role-select", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}