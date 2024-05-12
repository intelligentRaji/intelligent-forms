import { Validator } from '@/types/validator.type'

export function fieldEqualityValidator(fields: string[], message: string): Validator<Record<string, any>> {
  return (formValue) => {
    const filedsValues = fields.map((field) => formValue[field])

    return new Set(filedsValues).size > 1 ? message : null
  }
}
