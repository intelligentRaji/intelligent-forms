import { Validator } from '@/types/validator.type'

export function fieldEqualityValidator<T extends Record<string, any>>(fields: string[], message: string): Validator<T> {
  return (control) => {
    const filedsValues = fields.map((field) => control.value[field])

    return new Set(filedsValues).size > 1 ? message : null
  }
}
