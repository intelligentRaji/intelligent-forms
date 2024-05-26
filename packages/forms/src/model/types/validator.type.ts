import { type AbstractControl } from '../abstract/abstract-control'
import { ValidationError } from './validation-error.type'

export type Validator<T = any> = (value: AbstractControl<T>) => ValidationError | null
