import { Validator } from '@/index'

export function capitalizeValidator(message: string): Validator<string> {
  return (control) => (/^[A-Z].*$/.test(control.value) ? null : message)
}
