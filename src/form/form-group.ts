import {
  AbstractControl,
  EventOptions,
  AbstractControlValueType,
  InternalEventOptions,
} from '@/utils/abstract/abstract-control'
import { Validator } from '@/types/validator.type'

export type Controls = Record<string, AbstractControl<unknown>>

type FormGroupValueType<C extends Controls, K extends keyof C = keyof C> = Record<K, AbstractControlValueType<C[K]>>

export interface FormGroupProps<C extends Controls> {
  controls: C
  validators?: Validator<FormGroupValueType<C>>[]
}

export class FormGroup<C extends Controls = Controls> extends AbstractControl<FormGroupValueType<C>> {
  private _controls: C

  constructor({ controls, validators }: FormGroupProps<C>) {
    super({
      validators,
      initialValue: Object.fromEntries(
        Object.entries(controls).map(([key, control]) => [key, control.value]),
      ) as FormGroupValueType<C>,
    })

    this._controls = controls
    Object.values(this.controls).forEach((control) => control.setParent(this))
  }

  public get controls(): C {
    return this._controls
  }

  public setValue(value: Partial<FormGroupValueType<C>>, options: EventOptions = {}): void {
    Object.entries(value).forEach(([key, controlValue]) => {
      this.controls[key].setValue(controlValue, { emitEvent: options.emitEvent, onlySelf: true })
    })

    this._updateValueAndStatus(options)
  }

  public reset(options: { emitEvent?: boolean } = { emitEvent: true }): void {
    this.setValue(this.initialValue)
    this.markAsUntouched(options)
    this.markAsPristine(options)
    this._forEachChild((control) => control.reset(options))
  }

  public get<K extends keyof C>(name: K): C[K] {
    return this.controls[name]
  }

  public getControlName(control: AbstractControl<any>): keyof C | null {
    const entry = Object.entries(this.controls).find((pair) => pair.at(1) === control)

    if (!entry) {
      return null
    }

    return entry.at(0) as keyof C
  }

  public contains<K extends keyof C>(nameOfControlOrControl: K): boolean
  public contains(nameOfControlOrControl: AbstractControl<unknown>): boolean
  public contains(nameOfControlOrControl: keyof C | AbstractControl<unknown>): boolean {
    if (nameOfControlOrControl instanceof AbstractControl) {
      return Object.values(this.controls).includes(nameOfControlOrControl)
    }

    return !!this.controls[nameOfControlOrControl]
  }

  public addControl<K extends keyof C>(name: K, control: C[K], options: { emitEvent?: boolean } = {}): void {
    if (this.controls[name]) {
      return
    }

    this._registerControl(name, control)
    this._updateValueAndStatus(options)
  }

  public removeControl(name: keyof C, options: { emitEvent?: boolean } = {}): void {
    const control = this.controls[name]
    control.setParent(null)
    delete this.controls[name]
    this._updateValueAndStatus(options)
  }

  public setControl<K extends keyof C>(name: K, control: C[K], options: { emitEvent?: boolean } = {}): void {
    this._registerControl(name, control)
    this._updateValueAndStatus(options)
  }

  public override disable(): void {
    super.disable()
    this._forEachChild((control) => control.disable())
  }

  public override enable(): void {
    super.enable()
    this._forEachChild((control) => control.enable())
  }

  public override markAsTouched(options?: EventOptions): void
  /** @internal */
  public override markAsTouched<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void
  public override markAsTouched<T extends AbstractControl<any>>(options: InternalEventOptions<T> = {}): void {
    super.markAsTouched(options)
    this._forEachChild((control) => control.markAsTouched({ emitEvent: options.emitEvent, onlySelf: true }))
  }

  public override markAsUntouched(options?: EventOptions): void
  /** @internal */
  public override markAsUntouched<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void
  public override markAsUntouched<T extends AbstractControl<any>>(options: InternalEventOptions<T> = {}): void {
    super.markAsUntouched(options)
    this._forEachChild((control) => control.markAsUntouched({ emitEvent: options.emitEvent, onlySelf: true }))
  }

  public override markAsDirty(options?: EventOptions): void
  /** @internal */
  public override markAsDirty<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void
  public override markAsDirty<T extends AbstractControl<any>>(options: InternalEventOptions<T> = {}): void {
    super.markAsDirty(options)
    this._forEachChild((control) => control.markAsDirty({ emitEvent: options.emitEvent, onlySelf: true }))
  }

  public override markAsPristine(options?: EventOptions): void
  /** @internal */
  public override markAsPristine<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void
  public override markAsPristine<T extends AbstractControl<any>>(options: InternalEventOptions<T> = {}): void {
    super.markAsPristine(options)
    this._forEachChild((control) => control.markAsPristine({ emitEvent: options.emitEvent, onlySelf: true }))
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

  private _reduceValue(): FormGroupValueType<C> {
    return Object.fromEntries(
      Object.entries(this.controls).map(([key, control]) => [key, control.value]),
    ) as FormGroupValueType<C>
  }

  private _registerControl<K extends keyof C>(name: K, control: C[K]): void {
    control.setParent(this)
    this.controls[name] = control
  }
}
