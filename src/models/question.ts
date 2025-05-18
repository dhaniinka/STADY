import { Entity } from "./base/entity"
import { Option } from "./option"

export class Question extends Entity<string> {
  private _text: string
  private _options: Option[]
  private _correctAnswerId: string
  private _timeLimit: number

  constructor(id: string, text: string, options: Option[], correctAnswerId: string, timeLimit = 30) {
    super(id)
    this._text = text
    this._options = options
    this._correctAnswerId = correctAnswerId
    this._timeLimit = timeLimit
  }

  // Getters
  get text(): string {
    return this._text
  }

  get options(): Option[] {
    return [...this._options] // Return a copy to prevent direct modification
  }

  get correctAnswerId(): string {
    return this._correctAnswerId
  }

  get timeLimit(): number {
    return this._timeLimit
  }

  // Setters
  set text(value: string) {
    this._text = value
  }

  set correctAnswerId(value: string) {
    this._correctAnswerId = value
  }

  set timeLimit(value: number) {
    this._timeLimit = value
  }

  // Methods
  addOption(option: Option): void {
    this._options.push(option)
  }

  removeOption(optionId: string): void {
    this._options = this._options.filter((option) => option.id !== optionId)
  }

  getOption(optionId: string): Option | undefined {
    return this._options.find((option) => option.id === optionId)
  }

  isCorrectAnswer(optionId: string): boolean {
    return optionId === this._correctAnswerId
  }

  validate(): boolean {
    return (
      !!this._id &&
      !!this._text.trim() &&
      this._options.length >= 2 &&
      this._options.some((option) => option.id === this._correctAnswerId) &&
      this._options.every((option) => option.validate()) &&
      this._timeLimit > 0
    )
  }

  toJSON(): Record<string, any> {
    return {
      id: this._id,
      text: this._text,
      options: this._options.map((option) => option.toJSON()),
      correctAnswer: this._correctAnswerId,
      timeLimit: this._timeLimit,
    }
  }

  // DTO conversion method
  toDTO(): Record<string, any> {
    return {
      id: this._id,
      text: this._text,
      options: this._options.map((o) => o.toDTO()),
      correctAnswer: this._correctAnswerId,
      timeLimit: this._timeLimit,
    }
  }

  static fromJSON(data: any): Question {
    const options = (data.options || []).map(Option.fromJSON)
    return new Question(
      data.id,
      data.text,
      options,
      data.correctAnswer || data.correct_answer,
      data.timeLimit || data.time_limit || 30,
    )
  }
}
