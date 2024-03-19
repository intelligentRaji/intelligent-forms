import { ValidationError } from './validation-error.type'

export type ValidatorFabric = (message: string) => Validator

export type Validator = (value: string) => ValidationError
