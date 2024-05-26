import { ControlValueAccessor, ControlContainer, FormControl } from 'intelligent-forms'
import { BaseComponent, Props } from '../base-component/base-component'
import { TextFiledComponent } from '../text-field/text-field.component'
import { ErrorComponent } from '../error/error.component'

export interface InputNumberComponentProps extends Omit<Props<'input'>, 'text'> {
  label: string
  control: FormControl<number | null>
}

export class InputNumberComponent
  extends BaseComponent
  implements ControlValueAccessor<number>, ControlContainer<number | null>
{
  public control: FormControl<number | null>
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

      this.onChange(null)
    })

    this.focusableElement.addListener('blur', () => {
      this.onTouch()
    })

    this.append(this.focusableElement, error)
  }

  public onChange(value: number | null): void {}
  public onTouch(): void {}
  public writeValue(value: number | null): void {
    if (value === null) {
      this.focusableElement.setValue('')
      return
    }

    this.focusableElement.setValue(`${value}`)
  }
}
