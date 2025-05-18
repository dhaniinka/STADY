import type { SessionService } from "../interfaces/services/session-service"
import { Session, SessionStatus } from "../models/session"
import type { SessionRepository } from "../interfaces/repositories/session-repository"
import type { QuizRepository } from "../interfaces/repositories/quiz-repository"
import { v4 as uuidv4 } from "uuid"

export class SessionServiceImpl implements SessionService {
  private sessionRepository: SessionRepository
  private quizRepository: QuizRepository

  constructor(sessionRepository: SessionRepository, quizRepository: QuizRepository) {
    this.sessionRepository = sessionRepository
    this.quizRepository = quizRepository
  }

  async startSession(quizId: string, teacherId: string): Promise<{ session: Session | null; error?: string }> {
    try {
      // Check if quiz exists and belongs to the teacher
      const quiz = await this.quizRepository.findById(quizId)

      if (!quiz) {
        return { session: null, error: "Quiz not found" }
      }

      if (quiz.teacherId !== teacherId) {
        return { session: null, error: "You do not have permission to start this quiz" }
      }

      // Check if there's already an active session
      const activeSession = await this.sessionRepository.findActiveByQuiz(quizId)

      if (activeSession) {
        return { session: activeSession }
      }

      // Create new session
      const session = new Session(uuidv4(), quizId, teacherId)

      const createdSession = await this.sessionRepository.create(session)

      return { session: createdSession }
    } catch (error) {
      console.error("Error starting session:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to start session"
      return { session: null, error: errorMessage }
    }
  }

  async joinSession(quizId: string, studentId: string): Promise<{ sessionId: string | null; error?: string }> {
    try {
      // Check if quiz exists
      const quiz = await this.quizRepository.findById(quizId)

      if (!quiz) {
        return { sessionId: null, error: "Quiz not found" }
      }

      // Check if there's an active session
      let activeSession = await this.sessionRepository.findActiveByQuiz(quizId)

      if (!activeSession) {
        // Create a new session if none exists
        const session = new Session(uuidv4(), quizId, quiz.teacherId)

        activeSession = await this.sessionRepository.create(session)
      }

      // Add student to session
      const success = await this.sessionRepository.addParticipant(activeSession.id, studentId)

      if (!success) {
        return { sessionId: null, error: "Failed to join session" }
      }

      return { sessionId: activeSession.id }
    } catch (error) {
      console.error("Error joining session:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to join session"
      return { sessionId: null, error: errorMessage }
    }
  }

  async completeSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const session = await this.sessionRepository.findById(sessionId)

      if (!session) {
        return { success: false, error: "Session not found" }
      }

      if (session.status !== SessionStatus.ACTIVE) {
        return { success: false, error: "Session is not active" }
      }

      session.complete()
      await this.sessionRepository.update(session)

      return { success: true }
    } catch (error) {
      console.error("Error completing session:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to complete session"
      return { success: false, error: errorMessage }
    }
  }

  async cancelSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const session = await this.sessionRepository.findById(sessionId)

      if (!session) {
        return { success: false, error: "Session not found" }
      }

      if (session.status !== SessionStatus.ACTIVE) {
        return { success: false, error: "Session is not active" }
      }

      session.cancel()
      await this.sessionRepository.update(session)

      return { success: true }
    } catch (error) {
      console.error("Error cancelling session:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to cancel session"
      return { success: false, error: errorMessage }
    }
  }

  async getSessionParticipants(sessionId: string): Promise<{ participants: string[]; error?: string }> {
    try {
      const participants = await this.sessionRepository.findParticipants(sessionId)

      return { participants }
    } catch (error) {
      console.error("Error getting session participants:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to get participants"
      return { participants: [], error: errorMessage }
    }
  }

  async submitAnswer(
    sessionId: string,
    studentId: string,
    questionId: string,
    answerId: string,
    isCorrect: boolean,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const session = await this.sessionRepository.findById(sessionId)

      if (!session) {
        return { success: false, error: "Session not found" }
      }

      if (session.status !== SessionStatus.ACTIVE) {
        return { success: false, error: "Session is not active" }
      }

     

      return { success: true }
    } catch (error) {
      console.error("Error submitting answer:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to submit answer"
      return { success: false, error: errorMessage }
    }
  }
}
