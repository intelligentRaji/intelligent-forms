import { Validator } from '@/types/validator.type'

export function requiredValidator<T extends { length: number }>(message: string): Validator<T> {
  return (value) => (value.length ? null : message)
}
