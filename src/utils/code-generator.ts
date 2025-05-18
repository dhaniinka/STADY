export class CodeGenerator {
  private static readonly CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Removed confusing characters like 0, O, 1, I

  static generateQuizCode(length = 6): string {
    let code = ""

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * this.CHARACTERS.length)
      code += this.CHARACTERS.charAt(randomIndex)
    }

    return code
  }

  static normalizeCode(code: string): string {
    return code.trim().toUpperCase()
  }
}
