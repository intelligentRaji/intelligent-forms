import {
  AbstractControl,
  EventOptions,
  AbstractControlValueType,
  InternalEventOptions,
} from '@/utils/abstract/abstract-control'
import { Validator } from '@/types/validator.type'

export type Controls = Record<string, AbstractControl<unknown>>

type FromGoupValueType<C extends Controls, K extends keyof C = keyof C> = Record<K, AbstractControlValueType<C[K]>>

export interface FormGroupProps<C extends Controls> {
  controls: C
  validators?: Validator<FromGoupValueType<C>>[]
}

export class FormGroup<C extends Controls = Controls> extends AbstractControl<FromGoupValueType<C>> {
  private controls: C

  constructor({ controls, validators }: FormGroupProps<C>) {
    super({
      validators,
      initialValue: Object.fromEntries(
        Object.entries(controls).map(([key, control]) => [key, control.value]),
      ) as FromGoupValueType<C>,
    })
    this.controls = controls
  }

  public setValue(
    value: Partial<FromGoupValueType<C>>,
    { emitEvent = true, onlySelf = false }: EventOptions = {},
  ): void {
    Object.entries(value).forEach(([key, controlValue]) => {
      this.controls[key].setValue(controlValue, { emitEvent, onlySelf: true })
    })

    this._value = this.reduceValue()
    const isValid = this.validate()

    const isValidChange = this.valid !== isValid
    const isPristineChange = this._dirty !== false

    this._setValidState(isValid)
    this._dirty = true

    this._emitValueChangeEvent({ emitEvent, onlySelf })

    if (isValidChange) {
      this._emitStatusChangeEvent({ emitEvent, onlySelf })
    }

    if (isPristineChange) {
      this._emitPristineChangeEvent({ emitEvent, onlySelf })
    }
  }

  public override disable(): void {
    super.disable()
    this._forEachChild((control) => control.disable())
  }

  public override enable(): void {
    super.enable()
    this._forEachChild((control) => control.enable())
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

    if (
      Object.values(this.controls)
        .map((control) => control.valid)
        .includes(false) ||
      errors
    ) {
      return false
    }

    return true
  }

  /** @internal */
  public _updateDisableState(): void {
    if (this.isAllControlsDisabled()) {
      this.disable()
      return
    }

    this.enable()
  }

  /** @internal */
  public _updateValidity<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void {
    const isValid = this.validate()
    const change = this.valid !== isValid

    if (change) {
      this._setValidState(isValid)
      this._emitStatusChangeEvent(options)
    }
  }

  /** @internal */
  public _updateValue<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void {
    this._value = this.reduceValue()
    this._emitValueChangeEvent(options)
  }

  private isAllControlsDisabled(): boolean {
    return Object.values(this.controls)
      .map((control) => control.enabled)
      .includes(true)
  }

  private _forEachChild(fn: (control: AbstractControl<unknown>) => void): void {
    Object.values(this.controls).forEach(fn)
  }

  private reduceValue(): FromGoupValueType<C> {
    return Object.fromEntries(
      Object.entries(this.controls).map(([key, control]) => [key, control.value]),
    ) as FromGoupValueType<C>
  }
}
