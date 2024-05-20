import { ControlStatus } from '@/enums/control-status.enum'
import { type FormGroup } from '@/form/form-group/form-group'
import { ValidationError } from '@/types/validation-error.type'
import { Validator } from '@/types/validator.type'
import { Subject, Subscription } from '@/utils/subject'

export interface InternalEventOptions<T extends AbstractControl<any> = AbstractControl<any>> {
  emitEvent?: boolean
  onlySelf?: boolean
  sourceControl?: T
}

export type EventOptions = Omit<InternalEventOptions, 'sourceControl'>

export interface ControlEvent<T extends AbstractControl<any> = AbstractControl<any>> {
  source: T
}

export class ValueChangeEvent<V, C extends AbstractControl<any> = AbstractControl<any>> implements ControlEvent<C> {
  constructor(public readonly value: V, public readonly source: C) {}
}

export class StatusChangeEvent<C extends AbstractControl<any> = AbstractControl<any>> implements ControlEvent<C> {
  constructor(public readonly status: ControlStatus, public readonly source: C) {}
}

export class PristineChangeEvent<C extends AbstractControl<any> = AbstractControl<any>> implements ControlEvent<C> {
  constructor(public readonly pristine: boolean, public readonly source: C) {}
}

export class TouchedChangeEvent<C extends AbstractControl<any> = AbstractControl<any>> implements ControlEvent<C> {
  constructor(public readonly touched: boolean, public readonly source: C) {}
}

export class DisabledChangeEvent<C extends AbstractControl<any> = AbstractControl<any>> implements ControlEvent<C> {
  constructor(public readonly disabled: boolean, public readonly source: C) {}
}

interface ControlEventMap<T> {
  valuechange: ValueChangeEvent<T>
  pristinechange: PristineChangeEvent
  touchedchange: TouchedChangeEvent
  statuschange: StatusChangeEvent
  disabledchange: DisabledChangeEvent
  change: ValueChangeEvent<T> | PristineChangeEvent | TouchedChangeEvent | StatusChangeEvent | DisabledChangeEvent
}

export const controlEventMap = {
  valuechange: ValueChangeEvent,
  pristinechange: PristineChangeEvent,
  touchedchange: TouchedChangeEvent,
  statuschange: StatusChangeEvent,
  disabledchange: DisabledChangeEvent,
}

export abstract class AbstractControl<ControlValue> {
  protected readonly _events = new Subject<ControlEvent>()
  protected _initialValue: ControlValue
  protected _errors: ValidationError[] = []
  protected _validators: Validator<ControlValue>[]
  protected _parent: FormGroup<any> | null = null
  protected _touched = false
  protected _dirty = false
  protected _status!: ControlStatus
  protected _value!: ControlValue
  protected _disabled = false

  constructor(initialValue: ControlValue, validators: Validator<ControlValue>[] = []) {
    this._initialValue = initialValue
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

  public get status(): ControlStatus {
    return this._status
  }

  public get disabled(): boolean {
    return this._disabled
  }

  public get dirty(): boolean {
    return this._dirty
  }

  public get errors(): ValidationError[] {
    return this._errors
  }

  public get validators(): Validator<ControlValue>[] {
    return this._validators
  }

  public on<T extends keyof ControlEventMap<ControlEvent>>(
    event: T,
    fn: (event: ControlEventMap<ControlValue>[T]) => void,
  ): Subscription {
    if (event !== 'change') {
      return this._events.subscribe((e) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        if (e instanceof controlEventMap[event as keyof typeof controlEventMap]) {
          fn(e as ControlEventMap<ControlValue>[T])
        }
      })
    }

    return this._events.subscribe((e) => {
      fn(e as ControlEventMap<ControlValue>[T])
    })
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

  public disable({ emitEvent } = { emitEvent: true }): void {
    const change = this._disabled === false

    this._disabled = true

    if (change && emitEvent) {
      this._events.set(new DisabledChangeEvent(this._disabled, this))
    }
  }

  public enable({ emitEvent } = { emitEvent: true }): void {
    const change = this._disabled === true

    this._disabled = false

    if (change && emitEvent) {
      this._events.set(new DisabledChangeEvent(this._disabled, this))
    }
  }

  public markAsTouched(options?: EventOptions): void
  /** @internal */
  public markAsTouched<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void
  public markAsTouched<T extends AbstractControl<any>>(options: InternalEventOptions<T> = {}): void {
    this._updateTouched(true, options)
  }

  public markAsUntouched(options?: EventOptions): void
  /** @internal */
  public markAsUntouched<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void
  public markAsUntouched<T extends AbstractControl<any>>(options: InternalEventOptions<T> = {}): void {
    this._updateTouched(false, options)
  }

  public markAsDirty(options?: EventOptions): void
  /** @internal */
  public markAsDirty<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void
  public markAsDirty<T extends AbstractControl<any>>(options: InternalEventOptions<T> = {}): void {
    this._updateDirty(true, options)
  }

  public markAsPristine(options?: EventOptions): void
  /** @internal */
  public markAsPristine<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void
  public markAsPristine<T extends AbstractControl<any>>(options: InternalEventOptions<T> = {}): void {
    this._updateDirty(false, options)
  }

  /** @internal */
  public _updateTouched<T extends AbstractControl<any>>(
    touched: boolean,
    { emitEvent = true, onlySelf = false, sourceControl }: InternalEventOptions<T>,
  ): void {
    const change = this._touched !== touched

    this._touched = touched

    const control = sourceControl ?? this

    if (emitEvent && change) {
      this._events.set(new TouchedChangeEvent(this._touched, control))
    }

    if (!onlySelf && this._parent) {
      this._parent._updateTouched<typeof control>(control.touched, { emitEvent, onlySelf, sourceControl: control })
    }
  }

  /** @internal */
  protected _updateDirty<T extends AbstractControl<any>>(
    dirty: boolean,
    { emitEvent = true, onlySelf = false, sourceControl }: InternalEventOptions<T>,
  ): void {
    const change = this._dirty !== dirty

    this._dirty = dirty

    const control = sourceControl ?? this

    if (emitEvent && change) {
      this._events.set(new PristineChangeEvent(this._dirty, control))
    }

    if (!onlySelf && this._parent) {
      this._parent._updateDirty<typeof control>(control.dirty, { emitEvent, onlySelf, sourceControl: control })
    }
  }

  /** @internal */
  public _updateValueAndStatus<T extends AbstractControl<any>>({
    emitEvent = true,
    onlySelf = false,
    sourceControl,
  }: InternalEventOptions<T>): void {
    this._updateValue?.()

    const control = sourceControl ?? this
    const isValid = this._validate()
    const isValidChange = this.valid !== isValid

    this._setValidState(isValid)

    if (emitEvent) {
      this._events.set(new ValueChangeEvent(this._value, control))

      if (isValidChange) {
        this._events.set(new StatusChangeEvent(this._status, control))
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
        delete this._parent.controls[key]
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
  protected abstract _validate(): boolean

  /** @internal */
  protected _updateValue?(): void
}
