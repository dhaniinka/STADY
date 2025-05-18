"use server"

import { createClient, SupabaseClient } from "@supabase/supabase-js"

// Inisialisasi Supabase client dengan service role key untuk server actions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Singleton pattern untuk Supabase admin client
let supabaseAdminInstance: SupabaseClient<any, "public", any> | null = null

const getSupabaseAdmin = () => {
  if (supabaseAdminInstance) return supabaseAdminInstance

  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return supabaseAdminInstance
}

const supabaseAdmin = getSupabaseAdmin()

export async function setUserRoleAction(userId: string, role: "student" | "teacher", email?: string) {
  try {
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking profile:", checkError)
      return { success: false, error: checkError.message }
    }

    let result

    if (existingProfile) {
      // Update existing profile
      result = await supabaseAdmin.from("profiles").update({ role }).eq("id", userId)
    } else {
      // Create new profile
      result = await supabaseAdmin.from("profiles").insert([
        {
          id: userId,
          role,
          email: email || "",
          display_name: email ? email.split("@")[0] : "User",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
    }

    if (result.error) {
      console.error("Error updating/creating profile:", result.error)
      return { success: false, error: result.error.message }
    }

    return { success: true, role }
  } catch (error) {
    console.error("Error setting user role:", error)
    return { success: false, error: String(error) }
  }
}