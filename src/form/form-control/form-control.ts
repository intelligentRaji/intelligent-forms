import { Validator } from '@/types/validator.type'
import { ControlValueAccessor } from '@/interfaces/control-value-accessor.interface'
import { AbstractControl, EventOptions } from '../../abstract/abstract-control/abstract-control'

export class FormControl<ControlValue> extends AbstractControl<ControlValue> {
  private writeValue?: (value: ControlValue) => void

  constructor(initialValue: ControlValue, validators: Validator<ControlValue>[] = []) {
    super(initialValue, validators)
    this.setValue(initialValue, { emitEvent: false, onlySelf: true })
  }

  public setValue(value: ControlValue, options: EventOptions = {}): void {
    this._value = value
    this.writeValue?.(this._value)
    this._updateValueAndStatus(options)
  }

  public reset(options: EventOptions = {}): void {
    this.setValue(this._initialValue, options)
    this.markAsUntouched(options)
    this.markAsPristine(options)
  }

  public register(element: ControlValueAccessor<ControlValue>): void {
    element.writeValue(this._value)
    this.writeValue = element.writeValue

    element.onTouch = (): void => {
      this.markAsTouched()
    }

    element.onChange = (value: ControlValue): void => {
      this.markAsDirty()
      this.setValue(value)
    }
  }

  /** @internal */
  protected _validate(): boolean {
    const errors = this._validators.flatMap((validator) => {
      const error = validator(this)
      return error ? [error] : []
    })

    this._errors = errors

    return !errors.length
  }
}
