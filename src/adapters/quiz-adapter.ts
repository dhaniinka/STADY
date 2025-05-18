import type { Quiz } from "../models/quiz"
import { questionToDTO } from "./question-adapter"

export function quizToDTO(quiz: Quiz | null): any {
  if (!quiz) return null

  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    teacherId: quiz.teacherId,
    code: quiz.code,
    isPublic: quiz.isPublic,
    questions: quiz.questions.map(questionToDTO),
    questionCount: quiz.questionCount,
    createdAt: quiz.createdAt instanceof Date ? quiz.createdAt.toISOString() : quiz.createdAt,
    updatedAt: quiz.updatedAt instanceof Date ? quiz.updatedAt.toISOString() : quiz.updatedAt,
  }
}
