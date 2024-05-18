import { AbstractControl, EventOptions, InternalEventOptions } from '@/abstract/abstract-control/abstract-control'
import { Validator } from '@/types/validator.type'
import { DeepPartial } from '@/types/deep-partial.type'
import { FormControl } from '../form-control/form-control'

export type Controls = Record<string, AbstractControl<any>>

export type FormGroupValueType<T extends Controls> = {
  [K in keyof T]: T[K] extends FormControl<infer U> | undefined
    ? U
    : T[K] extends FormGroup<infer R> | undefined
    ? FormGroupValueType<R>
    : never
}

export class FormGroup<C extends Controls = Controls> extends AbstractControl<FormGroupValueType<C>> {
  private _controls: C

  constructor(controls: C, validators: Validator<FormGroupValueType<C>>[] = []) {
    super(
      Object.entries(controls).reduce<Record<string, any>>((acc, [key, control]) => {
        acc[key] = control.value
        return acc
      }, {}) as FormGroupValueType<C>,
      validators,
    )

    this._controls = { ...controls }
    this._forEachChild((control) => control._setParent(this, { onlySelf: true }))
    this._value = this.initialValue
    this._setValidState(this._validate())
  }

  public get controls(): C {
    return this._controls
  }

  public setValue(value: DeepPartial<FormGroupValueType<C>>, options: EventOptions = {}): void {
    Object.entries(value).forEach(([key, controlValue]) => {
      this.controls[key].setValue(controlValue, { emitEvent: options.emitEvent, onlySelf: true })
    })

    this._updateValueAndStatus(options)
  }

  public reset(options: EventOptions = {}): void {
    this._forEachChild((control) => control.reset({ emitEvent: options.emitEvent, onlySelf: true }))
    this.markAsUntouched(options)
    this.markAsPristine(options)
    this._updateValueAndStatus(options)
  }

  public get<K extends keyof C>(name: K): C[K] | null {
    return this.controls[name] || null
  }

  public getControlName(control: AbstractControl<any>): keyof C | null {
    const entry = Object.entries(this.controls).find((pair) => pair.at(1) === control)

    if (!entry) {
      return null
    }

    return entry.at(0) as keyof C
  }

  public contains<K extends keyof C>(nameOrControl: K): boolean
  public contains(nameOrControl: AbstractControl<any>): boolean
  public contains(nameOrControl: keyof C | AbstractControl<any>): boolean {
    if (nameOrControl instanceof AbstractControl) {
      return Object.values(this.controls).includes(nameOrControl)
    }

    return !!this.controls[nameOrControl]
  }

  public addControl<K extends keyof C>(name: K, control: C[K], options: { emitEvent?: boolean } = {}): void {
    if (this.controls[name]) {
      return
    }

    this._registerControl(name, control)
    this._updateValueAndStatus(options)
  }

  public removeControl(name: OptionalProperties<C>, options?: { emitEvent?: boolean }): void
  /** @internal */
  public removeControl(name: keyof C, options?: { emitEvent?: boolean }): void
  public removeControl(name: keyof C, options: { emitEvent?: boolean } = {}): void {
    const control = this.controls[name]
    control._setParent(null)
    delete this.controls[name]
    this._updateValueAndStatus(options)
  }

  public replaceControl<K extends keyof C>(name: K, control: C[K], options: { emitEvent?: boolean } = {}): void {
    this._registerControl(name, control)
    this._updateValueAndStatus(options)
  }

  public override disable({ emitEvent } = { emitEvent: true }): void {
    super.disable({ emitEvent })
    this._forEachChild((control) => control.disable({ emitEvent }))
  }

  public override enable({ emitEvent } = { emitEvent: true }): void {
    super.enable({ emitEvent })
    this._forEachChild((control) => control.enable({ emitEvent }))
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
    const errors = this._validators.flatMap((validator) => {
      const error = validator(this)
      return error !== null ? [error] : []
    })

    this._errors = errors

    if (Object.values(this.controls).some((control) => control.invalid) || errors.length > 0) {
      return false
    }

    return true
  }

  /** @internal */
  protected _updateValue(): void {
    this._value = this._reduceValue()
  }

  private _forEachChild(fn: (control: AbstractControl<any>) => void): void {
    Object.values(this.controls).forEach(fn)
  }

  private _reduceValue(): FormGroupValueType<C> {
    return Object.entries(this.controls).reduce<Record<string, any>>((acc, [key, control]) => {
      acc[key] = control.value
      return acc
    }, {}) as FormGroupValueType<C>
  }

  private _registerControl<K extends keyof C>(name: K, control: C[K]): void {
    this.controls[name] = control
    control._setParent(this, { onlySelf: true })
  }
}
