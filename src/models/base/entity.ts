export abstract class Entity<T> {
  protected _id: string

  constructor(id: string) {
    this._id = id
  }

  get id(): string {
    return this._id
  }

  abstract toJSON(): Record<string, any>
  abstract toDTO(): Record<string, any>
  abstract validate(): boolean
}
