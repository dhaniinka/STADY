import { Entity } from "./base/entity"

export class Option extends Entity<string> {
  private _text: string

  constructor(id: string, text: string) {
    super(id)
    this._text = text
  }

  get text(): string {
    return this._text
  }

  set text(value: string) {
    this._text = value
  }

  validate(): boolean {
    return !!this._id && !!this._text.trim()
  }

  toJSON(): Record<string, any> {
    return {
      id: this._id,
      text: this._text,
    }
  }

  // DTO conversion method
  toDTO(): Record<string, any> {
    return {
      id: this._id,
      text: this._text,
    }
  }

  static fromJSON(data: any): Option {
    return new Option(data.id, data.text)
  }
}
