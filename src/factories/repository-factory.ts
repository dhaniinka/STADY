import type { UserRepository } from "../interfaces/repositories/user-repository"
import type { QuizRepository } from "../interfaces/repositories/quiz-repository"
import type { SessionRepository } from "../interfaces/repositories/session-repository"
import { SupabaseUserRepository } from "../repositories/user-repository"
import { SupabaseQuizRepository } from "../repositories/quiz-repository"
import { SupabaseSessionRepository } from "../repositories/session-repository"

export class RepositoryFactory {
  private static userRepository: UserRepository
  private static quizRepository: QuizRepository
  private static sessionRepository: SessionRepository

  static getUserRepository(): UserRepository {
    if (!this.userRepository) {
      this.userRepository = new SupabaseUserRepository()
    }
    return this.userRepository
  }

  static getQuizRepository(): QuizRepository {
    if (!this.quizRepository) {
      this.quizRepository = new SupabaseQuizRepository()
    }
    return this.quizRepository
  }

  static getSessionRepository(): SessionRepository {
    if (!this.sessionRepository) {
      this.sessionRepository = new SupabaseSessionRepository()
    }
    return this.sessionRepository
  }
}
