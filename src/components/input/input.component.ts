import { AbstractFormControl, AbstractFormControlProps } from '@/utils/abstract/abstract-form-control'

export type InputComponentProps = Omit<AbstractFormControlProps<string, 'input'>, 'tag'>

export class InputComponent extends AbstractFormControl<string, 'input'> {
  constructor({ classes = [], parent, attributes, validators, initialValue }: InputComponentProps) {
    super({ tag: 'input', classes: ['input', ...classes], parent, attributes, validators, initialValue })
  }

  public reset(): void {
    this.setValue('')
  }
}
