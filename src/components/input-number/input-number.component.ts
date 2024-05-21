import { FormControl } from '@/form/form-control/form-control'
import { ControlContainer } from '@/interfaces/control-container.interface'
import { ControlValueAccessor } from '@/interfaces/control-value-accessor.interface'
import { BaseComponent, Props } from '@/utils/base-component'
import { TextFiledComponent } from '../text-field/text-field.component'
import { ErrorComponent } from '../error/error.component'

export interface InputNumberComponentProps extends Omit<Props<'input'>, 'text'> {
  label: string
  control: FormControl<number>
}

export class InputNumberComponent
  extends BaseComponent
  implements ControlValueAccessor<number>, ControlContainer<number>
{
  public control: FormControl<number>
  public focusableElement: TextFiledComponent

  constructor(p: InputNumberComponentProps) {
    super({ className: `${p.className} input` })
    this.control = p.control

    this.focusableElement = new TextFiledComponent({ className: p.className, control: this.control, label: p.label })
    const error = new ErrorComponent({ control: this.control, className: p.className })

    this.control.register(this)

    this.focusableElement.addListener('input', () => {
      if (this.focusableElement.value) {
        this.onChange(+this.focusableElement.value)
        return
      }

      this.onChange(0)
    })

    this.focusableElement.addListener('blur', () => {
      this.onTouch()
    })

    this.append(this.focusableElement, error)
  }

  public onChange(value: number): void {}
  public onTouch(): void {}
  public writeValue(value: number): void {
    this.focusableElement.setValue(`${value}`)
  }
}
