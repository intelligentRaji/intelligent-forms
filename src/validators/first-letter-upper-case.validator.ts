import { ValidatorFabric } from '@/types/validator.type'

export const firstLetterUpperCaseValidtor: ValidatorFabric = (message) => (value) =>
  /^[A-Z].*$/.test(value) ? null : message
