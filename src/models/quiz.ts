import { Entity } from "./base/entity"
import { Question } from "./question"
import { CodeGenerator } from "../utils/code-generator"

export class Quiz extends Entity<string> {
  private _title: string
  private _description: string | null
  private _teacherId: string
  private _code: string
  private _isPublic: boolean
  private _questions: Question[]
  private _createdAt: Date
  private _updatedAt: Date

  constructor(
    id: string,
    title: string,
    teacherId: string,
    questions: Question[] = [],
    code: string = CodeGenerator.generateQuizCode(),
    description: string | null = null,
    isPublic = false,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ) {
    super(id)
    this._title = title
    this._description = description
    this._teacherId = teacherId
    this._code = code
    this._isPublic = isPublic
    this._questions = questions
    this._createdAt = createdAt
    this._updatedAt = updatedAt
  }

  // Getters
  get title(): string {
    return this._title
  }

  get description(): string | null {
    return this._description
  }

  get teacherId(): string {
    return this._teacherId
  }

  get code(): string {
    return this._code
  }

  get isPublic(): boolean {
    return this._isPublic
  }

  get questions(): Question[] {
    return [...this._questions] // Return a copy to prevent direct modification
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  get questionCount(): number {
    return this._questions.length
  }

  // Setters
  set title(value: string) {
    this._title = value
    this._updatedAt = new Date()
  }

  set description(value: string | null) {
    this._description = value
    this._updatedAt = new Date()
  }

  set isPublic(value: boolean) {
    this._isPublic = value
    this._updatedAt = new Date()
  }

  // Methods
  addQuestion(question: Question): void {
    this._questions.push(question)
    this._updatedAt = new Date()
  }

  removeQuestion(questionId: string): void {
    this._questions = this._questions.filter((question) => question.id !== questionId)
    this._updatedAt = new Date()
  }

  getQuestion(questionId: string): Question | undefined {
    return this._questions.find((question) => question.id === questionId)
  }

  regenerateCode(): string {
    this._code = CodeGenerator.generateQuizCode()
    this._updatedAt = new Date()
    return this._code
  }

  validate(): boolean {
    return (
      !!this._id &&
      !!this._title.trim() &&
      !!this._teacherId &&
      !!this._code &&
      this._questions.length > 0 &&
      this._questions.every((question) => question.validate())
    )
  }

  toJSON(): Record<string, any> {
    return {
      id: this._id,
      title: this._title,
      description: this._description,
      teacherId: this._teacherId,
      code: this._code,
      isPublic: this._isPublic,
      questions: this._questions.map((question) => question.toJSON()),
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    }
  }

  // DTO conversion method
  toDTO(): Record<string, any> {
    return {
      id: this._id,
      title: this._title,
      description: this._description,
      teacherId: this._teacherId,
      code: this._code,
      isPublic: this._isPublic,
      questions: this._questions.map((q) => q.toDTO()),
      questionCount: this._questions.length,
      createdAt: this._createdAt instanceof Date ? this._createdAt.toISOString() : this._createdAt,
      updatedAt: this._updatedAt instanceof Date ? this._updatedAt.toISOString() : this._updatedAt,
    }
  }

  static fromJSON(data: any): Quiz {
    const questions = (data.questions || []).map(Question.fromJSON)
    return new Quiz(
      data.id,
      data.title,
      data.teacher_id || data.teacherId,
      questions,
      data.code,
      data.description,
      data.is_public || data.isPublic || false,
      new Date(data.created_at || data.createdAt),
      new Date(data.updated_at || data.updatedAt),
    )
  }
}
