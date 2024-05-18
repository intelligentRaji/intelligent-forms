import { Validator } from '@/types/validator.type'

export function minimumNumberValidator(minimumNumber: number, message: string): Validator<number> {
  return (control) => (control.value < minimumNumber ? message : null)
}
