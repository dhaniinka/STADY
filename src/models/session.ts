import { Entity } from "./base/entity"

export enum SessionStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export class Session extends Entity<string> {
  private _quizId: string
  private _teacherId: string
  private _startedAt: Date
  private _endedAt: Date | null
  private _status: SessionStatus
  private _settings: Record<string, any>

  constructor(
    id: string,
    quizId: string,
    teacherId: string,
    startedAt: Date = new Date(),
    status: SessionStatus = SessionStatus.ACTIVE,
    endedAt: Date | null = null,
    settings: Record<string, any> = {},
  ) {
    super(id)
    this._quizId = quizId
    this._teacherId = teacherId
    this._startedAt = startedAt
    this._endedAt = endedAt
    this._status = status
    this._settings = settings
  }

  // Getters
  get quizId(): string {
    return this._quizId
  }

  get teacherId(): string {
    return this._teacherId
  }

  get startedAt(): Date {
    return this._startedAt
  }

  get endedAt(): Date | null {
    return this._endedAt
  }

  get status(): SessionStatus {
    return this._status
  }

  get settings(): Record<string, any> {
    return { ...this._settings } // Return a copy to prevent direct modification
  }

  get isActive(): boolean {
    return this._status === SessionStatus.ACTIVE
  }

  // Methods
  complete(): void {
    this._status = SessionStatus.COMPLETED
    this._endedAt = new Date()
  }

  cancel(): void {
    this._status = SessionStatus.CANCELLED
    this._endedAt = new Date()
  }

  updateSetting(key: string, value: any): void {
    this._settings[key] = value
  }

  validate(): boolean {
    return (
      !!this._id &&
      !!this._quizId &&
      !!this._teacherId &&
      !!this._startedAt &&
      Object.values(SessionStatus).includes(this._status)
    )
  }

  toJSON(): Record<string, any> {
    return {
      id: this._id,
      quizId: this._quizId,
      teacherId: this._teacherId,
      startedAt: this._startedAt.toISOString(),
      endedAt: this._endedAt ? this._endedAt.toISOString() : null,
      status: this._status,
      settings: this._settings,
    }
  }

  // DTO conversion method
  toDTO(): Record<string, any> {
    return {
      id: this._id,
      quizId: this._quizId,
      teacherId: this._teacherId,
      startedAt: this._startedAt instanceof Date ? this._startedAt.toISOString() : this._startedAt,
      endedAt: this._endedAt instanceof Date ? this._endedAt.toISOString() : this._endedAt,
      status: this._status,
      settings: this._settings,
      isActive: this._status === SessionStatus.ACTIVE,
    }
  }

  static fromJSON(data: any): Session {
    return new Session(
      data.id,
      data.quiz_id || data.quizId,
      data.teacher_id || data.teacherId,
      new Date(data.started_at || data.startedAt),
      data.status as SessionStatus,
      data.ended_at || data.endedAt ? new Date(data.ended_at || data.endedAt) : null,
      data.settings || {},
    )
  }
}
