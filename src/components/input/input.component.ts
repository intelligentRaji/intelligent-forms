import { FormControl, AbstractFormControlProps } from '@/form/form-control'

export type InputComponentProps<Value> = Omit<AbstractFormControlProps<Value, 'input'>, 'tag'>

export class InputComponent extends FormControl<string, 'input'> {
  constructor({ classes = [], parent, attributes, validators, initialValue }: InputComponentProps<string>) {
    super({ tag: 'input', classes: ['input', ...classes], parent, attributes, validators, initialValue })
  }

  public clear(): void {
    this.setValue('')
  }
}
