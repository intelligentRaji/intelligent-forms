import { Validator } from '@/types/validator.type'

export function minimumLengthValidator<T extends { length: number }>(length: number, message: string): Validator<T> {
  return (control) => {
    const { value } = control
    return value.length < length ? message : null
  }
}
