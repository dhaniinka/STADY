import type { Question } from "../models/question"
import { optionToDTO } from "./option-adapter"

export function questionToDTO(question: Question | null): any {
  if (!question) return null

  return {
    id: question.id,
    text: question.text,
    options: question.options.map(optionToDTO),
    correctAnswer: question.correctAnswerId,
    timeLimit: question.timeLimit,
  }
}
