import type { Quiz } from "../../models/quiz"
import type { Question } from "../../models/question"

export interface QuizService {
  createQuiz(title: string, teacherId: string, questions: Question[]): Promise<{ quiz: Quiz | null; error?: string }>
  getQuizById(id: string): Promise<{ quiz: Quiz | null; error?: string }>
  getQuizByCode(code: string): Promise<{ quiz: Quiz | null; error?: string }>
  getTeacherQuizzes(teacherId: string): Promise<{ quizzes: Quiz[]; error?: string }>
  updateQuiz(quiz: Quiz): Promise<{ success: boolean; error?: string }>
  deleteQuiz(id: string): Promise<{ success: boolean; error?: string }>
}
