import { BaseComponent, Props } from '@/utils/base-component'
import { AbstractControl } from '@/utils/abstract/abstract-control'
import { FormContolTags } from '@/utils/abstract/abstract-form-control'

type AbstractControlValueType<T> = T extends AbstractControl<infer R, FormContolTags> ? R : never

type Controls = Record<string, AbstractControl<any, FormContolTags>>

export interface FormComponentProps<V extends Controls> extends Omit<Props<'form'>, 'tag' | 'text'> {
  onSubmit: <K extends keyof V>(formValue: Record<K, AbstractControlValueType<V[K]>>) => void
  controls: V
}

export class FormComponent<V extends Controls> extends BaseComponent<'form'> {
  private controls: Controls

  constructor({ classes = [], parent, attributes, onSubmit, controls }: FormComponentProps<V>) {
    super({ tag: 'form', classes: ['form', ...classes], parent, attributes })
    const formControls = Object.values(controls)
    this.append(...formControls)

    this.controls = controls

    this.addListener('submit', (e) => {
      e.preventDefault()
      onSubmit(this.getValue())
    })
  }

  public getValue<K extends keyof V>(): Record<K, AbstractControlValueType<V[K]>> {
    return Object.fromEntries(
      Object.entries(this.controls).map(([key, control]) => [key, control.getValue()]),
    ) as Record<K, AbstractControlValueType<V[K]>>
  }
}
