import { Validator } from '@/types/validator.type'

export function firstLetterUpperCaseValidtor(message: string): Validator<string> {
  return (value) => (/^[A-Z].*$/.test(value) ? null : message)
}
