import './input.component.scss'
import { FormControl } from '@/form/form-control/form-control'
import { ControlContainer } from '@/interfaces/control-container.interface'
import { Validator } from '@/types/validator.type'
import { BaseComponent, Props } from '@/utils/base-component'
import {
  DisabledChangeEvent,
  PristineChangeEvent,
  StatusChangeEvent,
  TouchedChangeEvent,
  ValueChangeEvent,
} from '@/abstract/abstract-control/abstract-control'
import { Subscription } from '@/utils/subject'
import { ErrorComponent } from '../error/error.component'

export interface InputComponentProps extends Omit<Props<'div'>, 'text'> {
  initialValue: string
  validators?: Validator<string>[]
  label?: string
}

export class InputComponent extends BaseComponent implements ControlContainer<string> {
  private subs: Subscription[] = []
  public control: FormControl<string>
  public input: BaseComponent<'input'>

  constructor(p: InputComponentProps) {
    super({ ...p, className: 'input-container' })
    this.control = new FormControl(p.initialValue, p.validators)

    if (p.label) {
      const label = new BaseComponent({ tag: 'label', className: `label ${p.className}`, text: p.label })
      this.append(label)
    }

    this.input = new BaseComponent({
      tag: 'input',
      type: 'text',
      className: `input ${p.className}`,
      value: p.initialValue,
    })

    this.input.addListener('input', () => {
      this.control.markAsDirty()
      this.control.setValue(this.input.node.value)
    })

    this.input.addListener('blur', () => {
      this.control.markAsTouched()
    })

    this.subs.push(
      this.control.on([StatusChangeEvent, ValueChangeEvent, PristineChangeEvent, TouchedChangeEvent], (event) => {
        const { control } = this
        if (!control.valid && control.touched && control.dirty && !control.disabled) {
          this.input.addClasses('invalid')
        } else {
          this.input.removeClasses('invalid')
        }

        if (event instanceof DisabledChangeEvent) {
          if (control.disabled) {
            this.input.node.disabled = true
            return
          }

          this.input.node.disabled = false
        }
      }),
    )

    const error = new ErrorComponent(this.control)
    this.append(this.input, error)
  }

  public override destroy(): void {
    super.destroy()
    this.subs.forEach((sub) => sub.unsubscribe())
  }
}
