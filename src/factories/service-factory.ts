import type { AuthService } from "../interfaces/services/auth-service"
import type { QuizService } from "../interfaces/services/quiz-service"
import type { SessionService } from "../interfaces/services/session-service"
import { SupabaseAuthService } from "../services/auth-service"
import { QuizServiceImpl } from "../services/quiz-service"
import { SessionServiceImpl } from "../services/session-service"
import { RepositoryFactory } from "./repository-factory"

export class ServiceFactory {
  private static authService: AuthService
  private static quizService: QuizService
  private static sessionService: SessionService

  static getAuthService(): AuthService {
    if (!this.authService) {
      const userRepository = RepositoryFactory.getUserRepository()
      this.authService = new SupabaseAuthService(userRepository)
    }
    return this.authService
  }

  static getQuizService(): QuizService {
    if (!this.quizService) {
      const quizRepository = RepositoryFactory.getQuizRepository()
      this.quizService = new QuizServiceImpl(quizRepository)
    }
    return this.quizService
  }

  static getSessionService(): SessionService {
    if (!this.sessionService) {
      const sessionRepository = RepositoryFactory.getSessionRepository()
      const quizRepository = RepositoryFactory.getQuizRepository()
      this.sessionService = new SessionServiceImpl(sessionRepository, quizRepository)
    }
    return this.sessionService
  }
}
