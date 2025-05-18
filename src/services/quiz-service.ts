import type { QuizService } from "../interfaces/services/quiz-service"
import { Quiz } from "../models/quiz"
import type { Question } from "../models/question"
import type { QuizRepository } from "../interfaces/repositories/quiz-repository"
import { v4 as uuidv4 } from "uuid"

export class QuizServiceImpl implements QuizService {
  private quizRepository: QuizRepository

  constructor(quizRepository: QuizRepository) {
    this.quizRepository = quizRepository
  }

  async createQuiz(
    title: string,
    teacherId: string,
    questions: Question[],
  ): Promise<{ quiz: Quiz | null; error?: string }> {
    try {
      if (!title.trim()) {
        return { quiz: null, error: "Quiz title is required" }
      }

      if (questions.length === 0) {
        return { quiz: null, error: "At least one question is required" }
      }

      // Validate all questions
      for (const question of questions) {
        if (!question.validate()) {
          return { quiz: null, error: "Invalid question format" }
        }
      }

      const quiz = new Quiz(uuidv4(), title, teacherId, questions)

      const createdQuiz = await this.quizRepository.create(quiz)

      return { quiz: createdQuiz }
    } catch (error) {
      console.error("Error creating quiz:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create quiz"
      return { quiz: null, error: errorMessage }
    }
  }

  async getQuizById(id: string): Promise<{ quiz: Quiz | null; error?: string }> {
    try {
      const quiz = await this.quizRepository.findById(id)

      if (!quiz) {
        return { quiz: null, error: "Quiz not found" }
      }

      return { quiz }
    } catch (error) {
      console.error("Error getting quiz by ID:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create quiz"
      return { quiz: null, error: errorMessage }
    }
  }

  async getQuizByCode(code: string): Promise<{ quiz: Quiz | null; error?: string }> {
    try {
      if (!code.trim()) {
        return { quiz: null, error: "Quiz code is required" }
      }

      const quiz = await this.quizRepository.findByCode(code)

      if (!quiz) {
        return { quiz: null, error: "Quiz not found with the provided code" }
      }

      return { quiz }
    } catch (error) {
      console.error("Error getting quiz by code:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create quiz"
      return { quiz: null, error: errorMessage }
    }
  }

  async getTeacherQuizzes(teacherId: string): Promise<{ quizzes: Quiz[]; error?: string }> {
    try {
      const quizzes = await this.quizRepository.findByTeacher(teacherId)

      return { quizzes }
    } catch (error) {
      console.error("Error getting teacher quizzes:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create quiz"
      return { quizzes: [], error: errorMessage }
    }
  }

  async updateQuiz(quiz: Quiz): Promise<{ success: boolean; error?: string }> {
    try {
      if (!quiz.validate()) {
        return { success: false, error: "Invalid quiz data" }
      }

      await this.quizRepository.update(quiz)

      return { success: true }
    } catch (error) {
      console.error("Error updating quiz:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create quiz"
      return { success: false, error: errorMessage }
    }
  }

  async deleteQuiz(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const success = await this.quizRepository.delete(id)

      if (!success) {
        return { success: false, error: "Failed to delete quiz" }
      }

      return { success: true }
    } catch (error) {
      console.error("Error deleting quiz:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create quiz"
      return { success: false, error: errorMessage }
    }
  }
}
