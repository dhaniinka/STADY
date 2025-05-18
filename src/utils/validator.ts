export class Validator {
  static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  static isValidPassword(password: string): boolean {
    return password.length >= 6
  }

  static isValidQuizTitle(title: string): boolean {
    return title.trim().length > 0
  }

  static isValidQuestionText(text: string): boolean {
    return text.trim().length > 0
  }

  static isValidOptionText(text: string): boolean {
    return text.trim().length > 0
  }
}
