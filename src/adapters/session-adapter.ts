import type { Session } from "../models/session"

export function sessionToDTO(session: Session | null): any {
  if (!session) return null

  return {
    id: session.id,
    quizId: session.quizId,
    teacherId: session.teacherId,
    startedAt: session.startedAt instanceof Date ? session.startedAt.toISOString() : session.startedAt,
    endedAt: session.endedAt instanceof Date ? session.endedAt.toISOString() : session.endedAt,
    status: session.status,
    settings: session.settings,
    isActive: session.isActive,
  }
}
