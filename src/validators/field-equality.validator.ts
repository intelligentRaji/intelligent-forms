import { Validator } from '@/types/validator.type'

export function fieldEqualityValidator(fields: string[], message: string): Validator<Record<string, any>> {
  return (formValue) => {
    const filedsValues = fields.map((field) => formValue[field])

    fields.forEach((field) => {
      if (filedsValues.every((value) => value === formValue[field])) {
        return null
      }
    })

    return message
  }
}
