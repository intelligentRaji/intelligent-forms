import { Validator } from '@/types/validator.type'
import { AbstractControl, EventOptions } from '../abstract/abstract-control/abstract-control'

export class FormControl<ControlValue> extends AbstractControl<ControlValue> {
  constructor(initialValue: ControlValue, validators: Validator<ControlValue>[] = []) {
    super(initialValue, validators)
    this.setValue(initialValue, { emitEvent: false, onlySelf: true })
  }

  public setValue(value: ControlValue, options: EventOptions = {}): void {
    this._value = value
    this._updateValueAndStatus(options)
  }

  public reset(options: { emitEvent?: boolean } = { emitEvent: true }): void {
    this.setValue(this.initialValue, options)
    this.markAsUntouched(options)
    this.markAsPristine(options)
  }

  /** @internal */
  protected _validate(): boolean {
    const errors = this._validators.flatMap((validator) => {
      const error = validator(this._value)
      return error ? error : []
    })

    this._errors = errors

    return !errors.length
  }

  /** @internal */
  protected _updateValue(): void {}
}
