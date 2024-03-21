import { Validator } from '@/types/validator.type'
import { AbstractControl } from '@/utils/abstract/abstract-control'
import { Props } from '@/utils/base-component'

export interface InputComponentProps extends Omit<Props<'input'>, 'tag' | 'text' | 'id'> {
  inititialValue: string
  validators?: Record<string, Validator>
}

export class InputComponent extends AbstractControl<string, 'input'> {
  constructor({ classes = [], parent, attributes, validators, inititialValue }: InputComponentProps) {
    super({ tag: 'input', classes: ['input', ...classes], parent, attributes, validators, inititialValue })
  }

  public setValue(value: string): void {
    throw new Error('Method not implemented.')
  }
  public reset(): void {
    throw new Error('Method not implemented.')
  }
}
