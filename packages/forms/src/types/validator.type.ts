import { type AbstractControl } from '@/abstract-control'
import { ValidationError } from './validation-error.type'

export type Validator<T = any> = (control: AbstractControl<T>) => ValidationError | null
