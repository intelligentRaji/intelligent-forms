import { Validator } from '@/types/validator.type'
import { BaseComponent, Props } from '@/utils/base-component'

type FormControl = {
  initialValue: string
  validators: Validator[]
}

export interface FormComponentProps<V extends Record<string, FormControl>> extends Omit<Props<'form'>, 'tag' | 'text'> {
  submit: (formValue: Record<string, V['initialValue']>) => void
  controls: V
}

export class FormComponent<V extends Record<string, FormControl>> extends BaseComponent<'form'> {
  constructor({ classes = [], parent, attributes, submit, controls }: FormComponentProps<V>) {
    super({ tag: 'form', classes: ['form', ...classes], parent, attributes })
    this.addListener('submit', (e) => {
      e.preventDefault()
      const data = new FormData(this.node).entries()
    })
  }
}
