import { Validator } from 'intelligent-forms'

export function capitalizeValidator(message: string): Validator<string> {
  return (control) => (/^[A-Z].*$/.test(control.value) ? null : message)
}
