import './text-field.component.scss'
import { AbstractControl } from '@/abstract/abstract-control/abstract-control'
import { BaseComponent, Props } from '@/utils/base-component'

export interface TextFiledComponentProps extends Omit<Props<'div'>, 'text'> {
  control: AbstractControl<any>
  label?: string
}

export class TextFiledComponent extends BaseComponent<'div'> {
  public input: BaseComponent<'input'>

  constructor(p: TextFiledComponentProps) {
    super({ ...p, className: `${p} text-field-container` })

    if (p.label) {
      this.append(new BaseComponent({ tag: 'label', className: `${p.className} label`, text: p.label }))
    }

    this.input = new BaseComponent({ tag: 'input', className: `${p.className} input`, parent: this })

    p.control.on('disabledchange', (e) => {
      if (e.disabled) {
        this.input.node.disabled = true
      }

      this.input.node.disabled = false
    })

    p.control.on('change', (e) => {
      const { control } = p

      if (!control.valid && control.touched && control.dirty && !control.disabled) {
        this.input.addClasses('invalid')
        return
      }

      this.input.removeClasses('invalid')
    })
  }

  public get value(): string {
    return this.input.node.value
  }

  public setValue(value: string): void {
    this.input.node.value = value
  }

  public override addListener<K extends keyof HTMLElementEventMap>(
    event: K,
    listener: (event: HTMLElementEventMap[K]) => void,
  ): void {
    this.input.addListener(event, listener)
  }
}
