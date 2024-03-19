import { ValidatorFabric } from '@/types/validator.type'

export const required: ValidatorFabric = (message) => (value) => value.length ? null : message
