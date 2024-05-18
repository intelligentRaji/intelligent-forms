import { Validator } from '@/types/validator.type'

export function requiredValidator(message: string): Validator {
  return (control) => {
    const { value } = control
    return value == null || ((typeof value === 'string' || Array.isArray(value)) && value.length === 0) ? message : null
  }
}
