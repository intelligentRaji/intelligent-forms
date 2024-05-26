import { Validator } from 'intelligent-forms'

export function minimumNumberValidator(minimumNumber: number, message: string): Validator<number | null> {
  return (control) => (control.value === null || control.value < minimumNumber ? message : null)
}
