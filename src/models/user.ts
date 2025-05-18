import { Entity } from "./base/entity"

export enum UserRole {
  STUDENT = "student",
  TEACHER = "teacher",
}

export class User extends Entity<string> {
  private _email: string
  private _role: UserRole
  private _displayName: string | null
  private _avatarUrl: string | null
  private _createdAt: Date
  private _updatedAt: Date

  constructor(
    id: string,
    email: string,
    role: UserRole,
    displayName: string | null = null,
    avatarUrl: string | null = null,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ) {
    super(id)
    this._email = email
    this._role = role
    this._displayName = displayName
    this._avatarUrl = avatarUrl
    this._createdAt = createdAt
    this._updatedAt = updatedAt
  }

  // Getters
  get email(): string {
    return this._email
  }

  get role(): UserRole {
    return this._role
  }

  get displayName(): string {
    return this._displayName || this._email.split("@")[0]
  }

  get avatarUrl(): string | null {
    return this._avatarUrl
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  // Setters
  set role(role: UserRole) {
    this._role = role
    this._updatedAt = new Date()
  }

  set displayName(name: string) {
    this._displayName = name
    this._updatedAt = new Date()
  }

  set avatarUrl(url: string | null) {
    this._avatarUrl = url
    this._updatedAt = new Date()
  }

  // Methods
  isTeacher(): boolean {
    return this._role === UserRole.TEACHER
  }

  isStudent(): boolean {
    return this._role === UserRole.STUDENT
  }

  validate(): boolean {
    return (
      !!this._id &&
      !!this._email &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this._email) &&
      Object.values(UserRole).includes(this._role)
    )
  }

  toJSON(): Record<string, any> {
    return {
      id: this._id,
      email: this._email,
      role: this._role,
      displayName: this.displayName,
      avatarUrl: this._avatarUrl,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    }
  }

  // DTO conversion method
  toDTO(): Record<string, any> {
    return {
      id: this._id,
      email: this._email,
      role: this._role,
      displayName: this.displayName,
      avatarUrl: this._avatarUrl,
      createdAt: this._createdAt instanceof Date ? this._createdAt.toISOString() : this._createdAt,
      updatedAt: this._updatedAt instanceof Date ? this._updatedAt.toISOString() : this._updatedAt,
    }
  }

  static fromJSON(data: any): User {
    return new User(
      data.id,
      data.email,
      data.role as UserRole,
      data.display_name || data.displayName,
      data.avatar_url || data.avatarUrl,
      new Date(data.created_at || data.createdAt),
      new Date(data.updated_at || data.updatedAt),
    )
  }
}
