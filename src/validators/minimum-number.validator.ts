import { Validator } from '@/types/validator.type'

export function minimumNumberValidator(minimumNumber: number, message: string): Validator<number | null> {
  return (control) => (control.value === null || control.value < minimumNumber ? message : null)
}
