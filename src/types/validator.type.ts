import { ValidationError } from './validation-error.type'

export type Validator<T> = (value: T) => ValidationError | null
