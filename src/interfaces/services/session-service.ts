import type { Session } from "../../models/session"

export interface SessionService {
  startSession(quizId: string, teacherId: string): Promise<{ session: Session | null; error?: string }>
  joinSession(quizId: string, studentId: string): Promise<{ sessionId: string | null; error?: string }>
  completeSession(sessionId: string): Promise<{ success: boolean; error?: string }>
  cancelSession(sessionId: string): Promise<{ success: boolean; error?: string }>
  getSessionParticipants(sessionId: string): Promise<{ participants: string[]; error?: string }>
  submitAnswer(
    sessionId: string,
    studentId: string,
    questionId: string,
    answerId: string,
    isCorrect: boolean,
  ): Promise<{ success: boolean; error?: string }>
}
