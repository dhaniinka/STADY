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

const supabase = getSupabaseAdmin()

export async function joinQuizSession(quizId: string, studentId: string) {
  try {
    console.log("Attempting to join quiz session. Quiz ID:", quizId, "Student ID:", studentId)

    // Cek apakah ada sesi aktif untuk quiz ini
    const { data: sessions, error: sessionError } = await supabase
      .from("quiz_sessions")
      .select("*")
      .eq("quiz_id", quizId)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1)

    if (sessionError) {
      console.error("Error checking for active sessions:", sessionError)
      throw sessionError
    }

    if (!sessions || sessions.length === 0) {
      console.log("No active session found for quiz ID:", quizId)

      // Jika tidak ada sesi aktif, buat sesi baru
      // Dapatkan teacher_id dari quiz
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .select("teacher_id")
        .eq("id", quizId)
        .single()

      if (quizError) {
        console.error("Error fetching quiz:", quizError)
        return {
          success: false,
          error: "Failed to fetch quiz information",
        }
      }

      // Buat sesi baru
      const { data: newSession, error: createError } = await supabase
        .from("quiz_sessions")
        .insert([
          {
            quiz_id: quizId,
            teacher_id: quiz.teacher_id,
            started_at: new Date().toISOString(),
            status: "active",
          },
        ])
        .select()

      if (createError) {
        console.error("Error creating new session:", createError)
        return {
          success: false,
          error: "Failed to create a new quiz session",
        }
      }

      const sessionId = newSession[0].id
      console.log("Created new session:", sessionId)

      // Tambahkan siswa ke sesi baru
      const { data: participant, error: insertError } = await supabase
        .from("session_participants")
        .insert([
          {
            session_id: sessionId,
            student_id: studentId,
            joined_at: new Date().toISOString(),
          },
        ])
        .select()

      if (insertError) {
        console.error("Error adding student to session:", insertError)
        return { success: false, error: "Failed to join quiz session" }
      }

      return { success: true, data: participant[0], sessionId }
    }

    const sessionId = sessions[0].id
    console.log("Found active session:", sessionId)

    // Cek apakah siswa sudah ada di sesi ini
    const { data: existingParticipant, error: participantError } = await supabase
      .from("session_participants")
      .select("*")
      .eq("session_id", sessionId)
      .eq("student_id", studentId)
      .maybeSingle()

    if (participantError && participantError.code !== "PGRST116") {
      // PGRST116 adalah "no rows returned" yang diharapkan
      console.error("Error checking if student is already in session:", participantError)
      return { success: false, error: "Failed to check session participation" }
    }

    // Jika siswa sudah ada di sesi, kembalikan data yang ada
    if (existingParticipant) {
      console.log("Student already in session")
      return { success: true, data: existingParticipant, sessionId }
    }

    // Jika tidak, tambahkan siswa ke sesi
    console.log("Adding student to session")
    const { data: participant, error: insertError } = await supabase
      .from("session_participants")
      .insert([
        {
          session_id: sessionId,
          student_id: studentId,
          joined_at: new Date().toISOString(),
        },
      ])
      .select()

    if (insertError) {
      console.error("Error adding student to session:", insertError)
      return { success: false, error: "Failed to join quiz session" }
    }

    return { success: true, data: participant[0], sessionId }
  } catch (error) {
    console.error("Error joining quiz session:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}