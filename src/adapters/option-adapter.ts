import type { Option } from "../models/option"

export function optionToDTO(option: Option | null): any {
  if (!option) return null

  return {
    id: option.id,
    text: option.text,
  }
}
