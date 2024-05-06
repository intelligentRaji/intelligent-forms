import { ControlStatus } from '@/enums/control-status.enum'
import { type FormGroup } from '@/form/form-group'
import { ValidationError } from '@/types/validation-error.type'
import { Validator } from '@/types/validator.type'
import { Subject } from '@/utils/subject'

export type AbstractControlValueType<C extends AbstractControl<unknown>> = C extends AbstractControl<infer R>
  ? R
  : never

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

export interface AbstractControlProps<ControlValue> {
  initialValue: ControlValue
  validators?: Validator<ControlValue>[]
}

export abstract class AbstractControl<ControlValue> {
  public events = new Subject<ControlEvent>()
  protected initialValue: ControlValue
  protected errors: ValidationError[] = []
  protected validators: Validator<ControlValue>[]
  protected _parent: FormGroup | null = null
  protected _touched = false
  protected _dirty = false
  protected _status: ControlStatus = ControlStatus.INVALID
  protected _value: ControlValue
  protected _disabled = false

  constructor({ initialValue, validators = [] }: AbstractControlProps<ControlValue>) {
    this.initialValue = initialValue
    this._value = initialValue
    this.validators = validators
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

  public setParent(parent: FormGroup): void {
    this._parent = parent
  }

  public getErrors(): ValidationError[] {
    return this.errors
  }

  public addValidators(...validators: Validator<ControlValue>[]): void {
    validators.forEach((validator) => this.validators.push(validator))
  }

  public removeValidators(...validators: Validator<ControlValue>[]): void {
    this.validators = this.validators.filter((validator) => validators.includes(validator))
  }

  public setValidators(validators: Validator<ControlValue>[]): void {
    this.validators = validators
  }

  public clearValidators(): void {
    this.validators = []
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
  protected _emitValueChangeEvent<T extends AbstractControl<any>>(options: InternalEventOptions<T> = {}): void {
    const control = options.sourceControl || this

    if (options.emitEvent) {
      this.events.set(new ValueChangeEvent(control.value, control))
    }

    if (this._parent && !options.onlySelf) {
      this._parent._updateValue(options)
    }
  }

  /** @internal */
  protected _emitTouchedChangeEvent<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void {
    const sourceControl = options.sourceControl ?? this

    if (options.emitEvent) {
      this.events.set(new TouchedChangeEvent(sourceControl.touched, sourceControl))
    }

    if (!options.onlySelf && this._parent) {
      return
    }

    if (this.touched) {
      this._parent!.markAsTouched({ sourceControl, ...options })
    }

    this._parent!.markAsUntouched({ sourceControl, ...options })
  }

  /** @internal */
  protected _emitPristineChangeEvent<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void {
    const sourceControl = options.sourceControl ?? this

    if (options.emitEvent) {
      this.events.set(new PristineChangeEvent(sourceControl.pristine, sourceControl))
    }

    if (this._parent && !options.onlySelf) {
      return
    }

    if (sourceControl.pristine) {
      this._parent!.markAsPristine({ sourceControl, ...options })
    }

    this._parent!.markAsDirty({ sourceControl, ...options })
  }

  /** @internal */
  protected _emitStatusChangeEvent<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void {
    const sourceControl = options.sourceControl ?? this

    if (options.emitEvent) {
      this.events.set(new StatusChangeEvent(sourceControl.status, sourceControl))
    }

    if (this._parent && !options.onlySelf) {
      this._parent._updateValidity(options)
    }
  }

  /** @internal */
  protected _setValidState(isValid: boolean): void {
    this._status = isValid ? ControlStatus.VALID : ControlStatus.INVALID
  }

  public abstract setValue(value: ControlValue, options?: EventOptions): void
  public abstract reset(): void
}
