import { AbstractControl, AbstractControlProps, EventOptions } from '../utils/abstract/abstract-control'

export class FormControl<ControlValue> extends AbstractControl<ControlValue> {
  constructor({ validators, initialValue }: AbstractControlProps<ControlValue>) {
    super({ initialValue, validators })
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
    const errors = this.validators.flatMap((validator) => {
      const error = validator(this._value)
      return error ? [error] : []
    })

    this.errors = errors

    return !!errors.length
  }

  /** @internal */
  protected _updateValue(): void {}
}
