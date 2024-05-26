import { Validator } from '@/index'

export function minimumNumberValidator(minimumNumber: number, message: string): Validator<number | null> {
  return (control) => (control.value === null || control.value < minimumNumber ? message : null)
}
