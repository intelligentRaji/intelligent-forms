import { Validator } from '@/types/validator.type'

export function capitalizeValidator(message: string): Validator<string> {
  return (value) => (/^[A-Z].*$/.test(value) ? null : message)
}
