import type { SessionRepository } from "../interfaces/repositories/session-repository"
import { BaseRepository } from "./base-repository"
import { Session, SessionStatus } from "../models/session"

export class SupabaseSessionRepository extends BaseRepository<Session> implements SessionRepository {
  constructor() {
    super("quiz_sessions")
  }

  mapToEntity(data: any): Session {
    return Session.fromJSON(data)
  }

  mapToDatabase(entity: Session): Record<string, any> {
    return {
      id: entity.id,
      quiz_id: entity.quizId,
      teacher_id: entity.teacherId,
      started_at: entity.startedAt.toISOString(),
      ended_at: entity.endedAt ? entity.endedAt.toISOString() : null,
      status: entity.status,
      settings: entity.settings,
    }
  }

  async findByQuiz(quizId: string): Promise<Session[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("quiz_id", quizId)
      .order("started_at", { ascending: false })

    if (error || !data) {
      return []
    }

    return data.map((item) => this.mapToEntity(item))
  }

  async findActiveByQuiz(quizId: string): Promise<Session | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("quiz_id", quizId)
      .eq("status", SessionStatus.ACTIVE)
      .order("started_at", { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return null
    }

    return this.mapToEntity(data)
  }

  async findByTeacher(teacherId: string): Promise<Session[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("teacher_id", teacherId)
      .order("started_at", { ascending: false })

    if (error || !data) {
      return []
    }

    return data.map((item) => this.mapToEntity(item))
  }

  async findByStatus(status: SessionStatus): Promise<Session[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("status", status)
      .order("started_at", { ascending: false })

    if (error || !data) {
      return []
    }

    return data.map((item) => this.mapToEntity(item))
  }

  async findParticipants(sessionId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from("session_participants")
      .select("student_id")
      .eq("session_id", sessionId)

    if (error || !data) {
      return []
    }

    return data.map((item) => item.student_id)
  }

  async addParticipant(sessionId: string, studentId: string): Promise<boolean> {
    // Check if participant already exists
    const { data: existingData, error: checkError } = await this.supabase
      .from("session_participants")
      .select("id")
      .eq("session_id", sessionId)
      .eq("student_id", studentId)
      .single()

    if (existingData) {
      // Participant already exists
      return true
    }

    // Add new participant
    const { error } = await this.supabase.from("session_participants").insert([
      {
        session_id: sessionId,
        student_id: studentId,
        joined_at: new Date().toISOString(),
        score: 0,
      },
    ])

    return !error
  }
}
