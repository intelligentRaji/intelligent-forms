import {
  AbstractControl,
  EventOptions,
  AbstractControlValueType,
  InternalEventOptions,
} from '@/utils/abstract/abstract-control'
import { Validator } from '@/types/validator.type'

export type Controls = Record<string, AbstractControl<unknown>>

type FormGoupValueType<C extends Controls, K extends keyof C = keyof C> = Record<K, AbstractControlValueType<C[K]>>

export interface FormGroupProps<C extends Controls> {
  controls: C
  validators?: Validator<FormGoupValueType<C>>[]
}

export class FormGroup<C extends Controls = Controls> extends AbstractControl<FormGoupValueType<C>> {
  private controls: C

  constructor({ controls, validators }: FormGroupProps<C>) {
    super({
      validators,
      initialValue: Object.fromEntries(
        Object.entries(controls).map(([key, control]) => [key, control.value]),
      ) as FormGoupValueType<C>,
    })
    this.controls = controls
  }

  public setValue(value: Partial<FormGoupValueType<C>>, options?: EventOptions): void {
    const emitEvent = options?.emitEvent || true
    const onlySelf = options?.onlySelf || false

    Object.entries(value).forEach(([key, controlValue]) => {
      this.controls[key].setValue(controlValue, { emitEvent, onlySelf: true })
    })

    this._updateValueAndStatusAndPristine({ emitEvent, onlySelf })
  }

  public reset(): void {
    this.setValue(this.initialValue)
  }

  public addControl<K extends keyof C>(name: K, control: C[K]): void {
    this.controls = { [name]: control, ...this.controls }
  }

  public override disable(): void {
    super.disable()
    this._forEachChild((control) => control.disable())
  }

  public override enable(): void {
    super.enable()
    this._forEachChild((control) => control.enable())
  }

  public override markAsTouched(options?: EventOptions | undefined): void
  /** @internal */
  public override markAsTouched<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void
  public override markAsTouched<T extends AbstractControl<any>>(options?: InternalEventOptions<T>): void {
    super.markAsTouched(options)
    this._forEachChild((control) => control.markAsTouched({ emitEvent: options?.emitEvent, onlySelf: true }))
  }

  public override markAsUntouched(options?: EventOptions | undefined): void
  /** @internal */
  public override markAsUntouched<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void
  public override markAsUntouched<T extends AbstractControl<any>>(options?: InternalEventOptions<T>): void {
    super.markAsUntouched(options)
    this._forEachChild((control) => control.markAsUntouched({ emitEvent: options?.emitEvent, onlySelf: true }))
  }

  public override markAsDirty(options?: EventOptions | undefined): void
  /** @internal */
  public override markAsDirty<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void
  public override markAsDirty<T extends AbstractControl<any>>(options?: InternalEventOptions<T>): void {
    super.markAsDirty(options)
    this._forEachChild((control) => control.markAsDirty({ emitEvent: options?.emitEvent, onlySelf: true }))
  }

  public override markAsPristine(options?: EventOptions | undefined): void
  /** @internal */
  public override markAsPristine<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void
  public override markAsPristine<T extends AbstractControl<any>>(options?: InternalEventOptions<T>): void {
    super.markAsPristine(options)
    this._forEachChild((control) => control.markAsPristine({ emitEvent: options?.emitEvent, onlySelf: true }))
  }

  /** @internal */
  protected _validate(): boolean {
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
    if (this._isAllControlsDisabled()) {
      this.disable()
      return
    }

    this.enable()
  }

  /** @internal */
  protected _updateValue(): void {
    this._value = this._reduceValue()
  }

  private _isAllControlsDisabled(): boolean {
    return Object.values(this.controls)
      .map((control) => control.enabled)
      .includes(true)
  }

  private _forEachChild(fn: (control: AbstractControl<unknown>) => void): void {
    Object.values(this.controls).forEach(fn)
  }

  private _reduceValue(): FormGoupValueType<C> {
    return Object.fromEntries(
      Object.entries(this.controls).map(([key, control]) => [key, control.value]),
    ) as FormGoupValueType<C>
  }

  private initControls(controls: C): void {
    Object.values(controls).forEach((control) => control.setParent(this))
  }
}
