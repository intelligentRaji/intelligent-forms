import { FormControl } from '@/form/form-control/form-control'
import { ControlContainer } from '@/interfaces/control-container.interface'
import { ControlValueAccessor } from '@/interfaces/control-value-accessor.interface'
import { BaseComponent, Props } from '@/utils/base-component'
import { TextFiledComponent } from '../text-field/text-field.component'
import { ErrorComponent } from '../error/error.component'

export interface InputComponentProps extends Omit<Props<'input'>, 'text'> {
  label: string
  control: FormControl<string>
}

export class InputComponent extends BaseComponent implements ControlContainer<string>, ControlValueAccessor<string> {
  public control: FormControl<string>
  public focusableElement: TextFiledComponent

  constructor(p: InputComponentProps) {
    super({ className: `${p.className} input` })
    this.control = p.control

    this.focusableElement = new TextFiledComponent({ className: p.className, control: this.control, label: p.label })
    const error = new ErrorComponent({ control: this.control, className: p.className })

    this.control.register(this)

    this.focusableElement.addListener('input', () => {
      this.onChange(this.focusableElement.value)
    })

    this.focusableElement.addListener('blur', () => {
      this.onTouch()
    })

    this.append(this.focusableElement, error)
  }

  public onChange(value: string): void {}
  public onTouch(): void {}
  public writeValue(value: string): void {
    this.focusableElement.setValue(value)
  }
}
