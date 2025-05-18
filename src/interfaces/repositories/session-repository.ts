import type { Repository } from "./repository"
import type { Session, SessionStatus } from "../../models/session"

export interface SessionRepository extends Repository<Session> {
  findByQuiz(quizId: string): Promise<Session[]>
  findActiveByQuiz(quizId: string): Promise<Session | null>
  findByTeacher(teacherId: string): Promise<Session[]>
  findByStatus(status: SessionStatus): Promise<Session[]>
  findParticipants(sessionId: string): Promise<string[]>
  addParticipant(sessionId: string, studentId: string): Promise<boolean>
}
