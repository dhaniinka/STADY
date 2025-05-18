"use server"

import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

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

export async function createQuiz(formData: FormData) {
  const title = formData.get("title") as string
  const teacherId = formData.get("teacherId") as string
  const questionsJson = formData.get("questions") as string
  const questions = JSON.parse(questionsJson)

  // Generate a unique code for the quiz
  const code = generateUniqueCode()

  try {
    const { data, error } = await supabase
      .from("quizzes")
      .insert([
        {
          title,
          teacher_id: teacherId,
          code,
          questions,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) throw error

    // Force revalidation of the dashboard page
    revalidatePath("/teacher/dashboard")

    return { success: true, data: data[0], code }
  } catch (error) {
    console.error("Error creating quiz:", error)
    return { success: false, error }
  }
}

export async function getTeacherQuizzes(teacherId: string) {
  try {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return { success: false, error }
  }
}

export async function getQuizByCode(code: string) {
  try {
    // Normalisasi kode quiz (hapus spasi dan ubah ke huruf besar)
    const normalizedCode = code.trim().toUpperCase()

    console.log("Mencari quiz dengan kode:", normalizedCode)

    // Cari quiz dengan kode tersebut
    const { data, error } = await supabase.from("quizzes").select("*").eq("code", normalizedCode)

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: "Database error" }
    }

    // Tidak ada quiz yang ditemukan dengan kode ini
    if (!data || data.length === 0) {
      console.log("Quiz tidak ditemukan dengan kode:", normalizedCode)
      return { success: false, error: "Quiz not found" }
    }

    // Jika ada beberapa quiz dengan kode yang sama (seharusnya tidak terjadi), ambil yang pertama
    if (data.length > 1) {
      console.warn("Multiple quizzes found with the same code:", normalizedCode)
    }

    console.log("Quiz ditemukan:", data[0].id)

    // Kembalikan quiz yang ditemukan
    return { success: true, data: data[0] }
  } catch (error) {
    console.error("Error fetching quiz:", error)
    return { success: false, error: "Error fetching quiz" }
  }
}

export async function startQuizSession(quizId: string, teacherId: string) {
  try {
    // First, check if there's already an active session for this quiz
    const { data: existingSessions, error: checkError } = await supabase
      .from("quiz_sessions")
      .select("*")
      .eq("quiz_id", quizId)
      .eq("teacher_id", teacherId)
      .eq("status", "active")

    if (checkError) throw checkError

    // If there's an active session, return it
    if (existingSessions && existingSessions.length > 0) {
      return { success: true, data: existingSessions[0] }
    }

    // Otherwise, create a new session
    const { data, error } = await supabase
      .from("quiz_sessions")
      .insert([
        {
          quiz_id: quizId,
          teacher_id: teacherId,
          started_at: new Date().toISOString(),
          status: "active",
        },
      ])
      .select()

    if (error) throw error

    return { success: true, data: data[0] }
  } catch (error) {
    console.error("Error starting quiz session:", error)
    return { success: false, error }
  }
}

export async function joinQuizSession(sessionId: string, studentId: string) {
  try {
    const { data, error } = await supabase
      .from("session_participants")
      .insert([
        {
          session_id: sessionId,
          student_id: studentId,
          joined_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) throw error

    return { success: true, data: data[0] }
  } catch (error) {
    console.error("Error joining quiz session:", error)
    return { success: false, error }
  }
}

export async function submitAnswer(
  sessionId: string,
  studentId: string,
  questionId: string,
  answerId: string,
  isCorrect: boolean,
) {
  try {
    const { data, error } = await supabase
      .from("student_answers")
      .insert([
        {
          session_id: sessionId,
          student_id: studentId,
          question_id: questionId,
          answer_id: answerId,
          is_correct: isCorrect,
          submitted_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) throw error

    // Update participant score if answer is correct
    if (isCorrect) {
      await supabase.rpc("increment_score", {
        p_session_id: sessionId,
        p_student_id: studentId,
        p_increment: 1,
      })
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error submitting answer:", error)
    return { success: false, error }
  }
}

// Helper function to generate a unique code
function generateUniqueCode() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Removed confusing characters like 0, O, 1, I
  let code = ""

  // Generate a 6-character code
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    code += characters.charAt(randomIndex)
  }

  return code
}