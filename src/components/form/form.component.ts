import { Validator } from '@/types/validator.type'
import { BaseComponent, Props } from '@/utils/base-component'
import { InputComponent } from '../input/input.component'

type FormControl = {
  initialValue: string
  attributes: Partial<HTMLInputElement>
  validators: Record<string, Validator>
}

export interface FormComponentProps<V extends Record<string, FormControl>> extends Omit<Props<'form'>, 'tag' | 'text'> {
  submit: <K extends keyof V>(formValue: Record<K, V[K]['initialValue']>) => void
  controls: V
}

export class FormComponent<V extends Record<string, FormControl>> extends BaseComponent<'form'> {
  constructor({ classes = [], parent, attributes, submit, controls }: FormComponentProps<V>) {
    super({ tag: 'form', classes: ['form', ...classes], parent, attributes })
    Object.entries(controls).forEach(([key, control]) => {
      const input = new InputComponent({
        parent: this.node,
        validators: control.validators,
        attributes: { ...control.attributes, name: key },
        inititialValue: control.initialValue,
      })
    })

    this.addListener('submit', (e) => {
      e.preventDefault()
    })
  }
}
