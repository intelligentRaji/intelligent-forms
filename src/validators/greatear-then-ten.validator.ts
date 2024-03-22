import { Validator } from '@/types/validator.type'

export const greatierThenTenValidator: Validator<number> = (value) => (value > 10 ? null : 'error')
