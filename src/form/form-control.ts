import { AbstractControl, AbstractControlProps, EventOptions } from '../utils/abstract/abstract-control'

export class FormControl<ControlValue> extends AbstractControl<ControlValue> {
  constructor({ validators, initialValue }: AbstractControlProps<ControlValue>) {
    super({ initialValue, validators })
  }

  public setValue(value: ControlValue, options: EventOptions = {}): void {
    this._value = value
    const isValid = this.validate()

    const isValidChange = this.valid !== isValid
    const isPristineChange = this._dirty === false

    this._dirty = true
    this._setValidState(isValid)

    this._emitValueChangeEvent(options)

    if (isPristineChange) {
      this._emitPristineChangeEvent(options)
    }
  }

  public reset(): void {
    this.setValue(this.initialValue)
  }

  private validate(): boolean {
    const errors = this.validators.flatMap((validator) => {
      const error = validator(this._value)
      return error ? [error] : []
    })

    this.errors = errors

    return !!errors.length
  }
}
