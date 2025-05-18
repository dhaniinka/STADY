import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Get the quiz code from the URL
  const quizCode = req.nextUrl.pathname.split("/").pop()

  if (!quizCode) {
    return NextResponse.redirect(new URL("/student/join", req.url))
  }

  // Check if the quiz code exists
  const { data, error } = await supabase.from("quizzes").select("id").eq("code", quizCode).single()

  if (error || !data) {
    // Invalid quiz code, redirect to join page
    return NextResponse.redirect(new URL("/student/join", req.url))
  }

  return res
}