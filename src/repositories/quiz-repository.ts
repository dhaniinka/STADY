import type { QuizRepository } from "../interfaces/repositories/quiz-repository"
import { BaseRepository } from "./base-repository"
import { Quiz } from "../models/quiz"

export class SupabaseQuizRepository extends BaseRepository<Quiz> implements QuizRepository {
  constructor() {
    super("quizzes")
  }

  mapToEntity(data: any): Quiz {
    return Quiz.fromJSON(data)
  }

  mapToDatabase(entity: Quiz): Record<string, any> {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      teacher_id: entity.teacherId,
      code: entity.code,
      is_public: entity.isPublic,
      questions: entity.questions.map((q) => q.toJSON()),
      updated_at: new Date().toISOString(),
    }
  }

  async findByCode(code: string): Promise<Quiz | null> {
    // Normalize code (remove spaces and convert to uppercase)
    const normalizedCode = code.trim().toUpperCase()

    const { data, error } = await this.supabase.from(this.tableName).select("*").eq("code", normalizedCode).single()

    if (error || !data) {
      return null
    }

    return this.mapToEntity(data)
  }

  async findByTeacher(teacherId: string): Promise<Quiz[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false })

    if (error || !data) {
      return []
    }

    return data.map((item) => this.mapToEntity(item))
  }

  async findPublicQuizzes(): Promise<Quiz[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false })

    if (error || !data) {
      return []
    }

    return data.map((item) => this.mapToEntity(item))
  }
}
