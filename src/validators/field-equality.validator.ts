import { Validator } from '@/types/validator.type'

export function fieldEqualityValidator(fields: string[], message: string): Validator<Record<string, any>> {
  return (control) => {
    const filedsValues = fields.map((field) => control.value[field])

    return new Set(filedsValues).size > 1 ? message : null
  }
}
