import { ControlStatus } from '@/enums/control-status.enum'
import { type FormGroup } from '@/form/form-group/form-group'
import { ValidationError } from '@/types/validation-error.type'
import { Validator } from '@/types/validator.type'
import { Subject } from '@/utils/subject'

export type AbstractControlValueType<C extends AbstractControl<any>> = C extends AbstractControl<infer R> ? R : never

export interface InternalEventOptions<T extends AbstractControl<any> = AbstractControl<any>> {
  emitEvent?: boolean
  onlySelf?: boolean
  sourceControl?: T
}

export type EventOptions = Omit<InternalEventOptions, 'sourceControl'>

export interface ControlEvent<T extends AbstractControl<any> = AbstractControl<any>> {
  source: T
}

export class ValueChangeEvent<C extends AbstractControl<any>> implements ControlEvent<C> {
  constructor(public readonly value: AbstractControlValueType<C>, public readonly source: C) {}
}

export class StatusChangeEvent<C extends AbstractControl<any>> implements ControlEvent<C> {
  constructor(public readonly status: ControlStatus, public readonly source: C) {}
}

export class PristineChangeEvent<C extends AbstractControl<any>> implements ControlEvent<C> {
  constructor(public readonly pristine: boolean, public readonly source: C) {}
}

export class TouchedChangeEvent<C extends AbstractControl<any>> implements ControlEvent<C> {
  constructor(public readonly touched: boolean, public readonly source: C) {}
}

export abstract class AbstractControl<ControlValue> {
  public readonly events = new Subject<ControlEvent>()
  protected initialValue: ControlValue
  protected _errors: ValidationError[] = []
  protected _validators: Validator<ControlValue>[]
  protected _parent: FormGroup | null = null
  protected _touched = false
  protected _dirty = false
  protected _status!: ControlStatus
  protected _value!: ControlValue
  protected _disabled = false

  constructor(initialValue: ControlValue, validators: Validator<ControlValue>[] = []) {
    this.initialValue = initialValue
    this._validators = validators
  }

  public get value(): ControlValue {
    return this._value
  }

  public get touched(): boolean {
    return this._touched
  }

  public get valid(): boolean {
    return this._status === ControlStatus.VALID
  }

  public get invalid(): boolean {
    return this._status === ControlStatus.INVALID
  }

  public get status(): ControlStatus {
    return this._status
  }

  public get disabled(): boolean {
    return this._disabled
  }

  public get enabled(): boolean {
    return !this._disabled
  }

  public get dirty(): boolean {
    return this._dirty
  }

  public get pristine(): boolean {
    return !this._dirty
  }

  public get errors(): ValidationError[] {
    return this._errors
  }

  public get validators(): Validator<ControlValue>[] {
    return this._validators
  }

  public addValidators(validators: Validator<ControlValue>[], options: EventOptions = {}): void {
    validators.forEach((validator) => this._validators.push(validator))
    this._updateValueAndStatus(options)
  }

  public removeValidators(validators: Validator<ControlValue>[], options: EventOptions = {}): void {
    this._validators = this._validators.filter((validator) => !validators.includes(validator))
    this._updateValueAndStatus(options)
  }

  public setValidators(validators: Validator<ControlValue>[], options: EventOptions = {}): void {
    this._validators = validators
    this._updateValueAndStatus(options)
  }

  public clearValidators(options: EventOptions = {}): void {
    this._validators = []
    this._updateValueAndStatus(options)
  }

  public disable(): void {
    this._disabled = true
    this._parent?._updateDisableState()
  }

  public enable(): void {
    this._disabled = false
    this._parent?._updateDisableState()
  }

  public markAsTouched(options?: EventOptions): void
  /** @internal */
  public markAsTouched<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void
  public markAsTouched<T extends AbstractControl<any>>(options: InternalEventOptions<T> = {}): void {
    const change = this._touched === false

    if (change) {
      this._touched = true
      this._emitTouchedChangeEvent(options)
    }
  }

  public markAsUntouched(options?: EventOptions): void
  /** @internal */
  public markAsUntouched<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void
  public markAsUntouched<T extends AbstractControl<any>>(options: InternalEventOptions<T> = {}): void {
    const change = this._touched === true

    if (change) {
      this._touched = false
      this._emitTouchedChangeEvent(options)
    }
  }

  public markAsDirty(options?: EventOptions): void
  /** @internal */
  public markAsDirty<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void
  public markAsDirty<T extends AbstractControl<any>>(options: InternalEventOptions<T> = {}): void {
    const change = this._dirty === false

    if (change) {
      this._dirty = true
      this._emitPristineChangeEvent(options)
    }
  }

  public markAsPristine(options?: EventOptions): void
  /** @internal */
  public markAsPristine<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void
  public markAsPristine<T extends AbstractControl<any>>(options: InternalEventOptions<T> = {}): void {
    const change = this._dirty === true

    if (change) {
      this._dirty = false
      this._emitPristineChangeEvent(options)
    }
  }

  /** @internal */
  protected _emitTouchedChangeEvent<T extends AbstractControl<any>>({
    emitEvent = true,
    onlySelf = false,
    sourceControl,
  }: InternalEventOptions<T>): void {
    const control = sourceControl ?? this

    if (emitEvent) {
      this.events.set(new TouchedChangeEvent(control.touched, control))
    }

    if (onlySelf || !this._parent) {
      return
    }

    if (this.touched) {
      this._parent!.markAsTouched({ emitEvent, onlySelf, sourceControl: control })
    }

    this._parent!.markAsUntouched({ emitEvent, onlySelf, sourceControl: control })
  }

  /** @internal */
  protected _emitPristineChangeEvent<T extends AbstractControl<any>>({
    emitEvent = true,
    onlySelf = false,
    sourceControl,
  }: InternalEventOptions<T>): void {
    const control = sourceControl ?? this

    if (emitEvent) {
      this.events.set(new PristineChangeEvent(control.pristine, control))
    }

    if (onlySelf || !this._parent) {
      return
    }

    if (control.pristine) {
      this._parent!.markAsPristine({ emitEvent, onlySelf, sourceControl: control })
    }

    this._parent!.markAsDirty({ emitEvent, onlySelf, sourceControl: control })
  }

  /** @internal */
  public _updateValueAndStatus<T extends AbstractControl<any>>({
    emitEvent = true,
    onlySelf = false,
    sourceControl,
  }: InternalEventOptions<T>): void {
    this._updateValue()
    const isValid = this._validate()

    const isValidChange = this.valid !== isValid

    this._setValidState(isValid)

    const control = sourceControl ?? this

    if (emitEvent) {
      this.events.set(new ValueChangeEvent(control.value, control))

      if (isValidChange) {
        this.events.set(new StatusChangeEvent(control.status, control))
      }
    }

    if (this._parent && !onlySelf) {
      this._parent._updateValueAndStatus<typeof control>({ sourceControl: control, emitEvent, onlySelf })
    }
  }

  /** @internal */
  public _setParent(parent: FormGroup<any> | null, options: EventOptions = {}): void {
    if (this._parent) {
      const key = this._parent.getControlName(this)

      if (key) {
        this._parent.removeControl(key)
      }
    }

    this._parent = parent
    this._updateValueAndStatus(options)
  }

  /** @internal */
  protected _setValidState(isValid: boolean): void {
    this._status = isValid ? ControlStatus.VALID : ControlStatus.INVALID
  }

  public abstract setValue(value: ControlValue, options?: EventOptions): void
  public abstract reset(options: EventOptions): void
  /** @internal */
  protected abstract _updateValue(): void
  /** @internal */
  protected abstract _validate(): boolean
}
