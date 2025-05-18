import type { Repository } from "./repository"
import type { Quiz } from "../../models/quiz"

export interface QuizRepository extends Repository<Quiz> {
  findByCode(code: string): Promise<Quiz | null>
  findByTeacher(teacherId: string): Promise<Quiz[]>
  findPublicQuizzes(): Promise<Quiz[]>
}
