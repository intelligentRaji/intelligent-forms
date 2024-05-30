import { Subject, Subscription } from '@/utils'
import { type FormGroup } from './model/form-group/form-group'
import { ValidationError, Validator } from './types'

/**
 * A form can have several different statuses. Each
 * possible status is returned as a string literal.
 *
 * * **VALID**: Reports that a control is valid, meaning that no errors exist in the input
 * value.
 * * **INVALID**: Reports that a control is invalid, meaning that an error exists in the input
 * value.
 *
 * @public
 */
export type ControlStatus = 'VALID' | 'INVALID'

export interface InternalEventOptions<T extends AbstractControl<any> = AbstractControl<any>> {
  emitEvent?: boolean
  onlySelf?: boolean
  sourceControl?: T
}

export type EventOptions = {
  emitEvent?: boolean
  onlySelf?: boolean
}

export interface ControlEvent<T extends AbstractControl<any> = AbstractControl<any>> {
  source: T
}

/**
 * The event is fired when the value of the control changes.
 */
export class ValueChangeEvent<V, C extends AbstractControl<any> = AbstractControl<any>> implements ControlEvent<C> {
  constructor(public readonly value: V, public readonly source: C) {}
}

/**
 * The event is fired when the status of the control changes.
 */
export class StatusChangeEvent<C extends AbstractControl<any> = AbstractControl<any>> implements ControlEvent<C> {
  constructor(public readonly status: ControlStatus, public readonly source: C) {}
}

/**
 * The event is fired when the pristine state of the control changes.
 */
export class PristineChangeEvent<C extends AbstractControl<any> = AbstractControl<any>> implements ControlEvent<C> {
  constructor(public readonly pristine: boolean, public readonly source: C) {}
}

/**
 * The event is fired when the touched state of the control changes.
 */
export class TouchedChangeEvent<C extends AbstractControl<any> = AbstractControl<any>> implements ControlEvent<C> {
  constructor(public readonly touched: boolean, public readonly source: C) {}
}

/**
 * The event is fired when the disabled state of the control changes.
 */
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

const controlEventMap = {
  valuechange: ValueChangeEvent,
  pristinechange: PristineChangeEvent,
  touchedchange: TouchedChangeEvent,
  statuschange: StatusChangeEvent,
  disabledchange: DisabledChangeEvent,
}

/**
 * @abstract
 * @classdesc This is the base class for `FormControl` and `FormGroup`.
 *
 * It provides some of the shared behavior that all controls and groups of controls have, like
 * validity checking, calculating status, adding and removing validators. It also defines the properties
 * that are shared between all sub-classes, like `value`, `valid`, and `dirty`, and defines methods to
 * operate on these properties. It shouldn't be instantiated directly.
 *
 * The type parameter ControlValue represents the value type of the control (`control.value`).
 */
export abstract class AbstractControl<ControlValue> {
  /**
   * @internal
   * @member
   * A multicasting observable that emits an event every time the state of the control changes.
   * It emits for value, status, pristine, disable or touched changes.
   *
   * **Note**: The emission occurs immediately after the control's value associated with this
   *  event is updated. Therefore, accessing the parent control's values
   *  (for example, if this FormControl is part of a FormGroup) from this event's callback may
   *  result in values that have not yet been updated. Listen to parental control changes instead.
   */
  protected readonly _events = new Subject<ControlEvent>()
  /** @internal */
  public _parent: FormGroup<any> | null = null

  /** @internal */
  protected _initialValue: ControlValue

  /** @internal */
  protected _errors: ValidationError[] = []

  /** @internal */
  protected _validators: Validator<ControlValue>[]

  /** @internal */
  protected _touched = false

  /** @internal */
  protected _dirty = false

  /** @internal */
  protected _status!: ControlStatus

  /** @internal */
  protected _value!: ControlValue

  /** @internal */
  protected _disabled = false

  /**
   * Constructs a new instance of the AbstractControl class.
   *
   * @param initialValue - The initial value of the control.
   * @param validators - An optional array of validators to apply to the control.
   *
   * Validators is executed then value changes and used to check is the control is
   * valid or not
   *
   * The validators will be executed in the order in which they were added.
   *
   * @public
   */
  constructor(initialValue: ControlValue, validators: Validator<ControlValue>[] = []) {
    this._initialValue = initialValue
    this._validators = validators
  }

  /**
   * Get the value of the control.
   *
   * @return {ControlValue} The value of the control.
   *
   * @public
   */
  public get value(): ControlValue {
    return this._value
  }

  /**
   * Returns a boolean indicating whether the control has been touched or not.
   * The control is touched then a user raises a blur event on the element conected
   * to the control in the UI
   *
   * @return {boolean}
   *
   * @public
   */
  public get touched(): boolean {
    return this._touched
  }

  /**
   * Returns a boolean indicating whether the control is valid or not.
   * The control is valid if the control's value has passed the validation of every
   * validator provided to the control.
   *
   * @return {boolean} - True if the control is valid, false otherwise.
   *
   * @public
   */
  public get valid(): boolean {
    return this._status === 'VALID'
  }

  /**
   * Returns a status indicating whether the control is valid or not.
   * The control is invalid if the control's value has not passed the validation of
   * one of the validators provided to the control.
   *
   * @return {ControlStatus} - Valid if the control is valid, INVALID otherwise.
   *
   * @public
   */
  public get status(): ControlStatus {
    return this._status
  }

  /**
   * Returns a boolean indicating whether the control is disabled or not.
   *
   * @return {boolean} - True if the control is disabled, false otherwise.
   *
   * @public
   */
  public get disabled(): boolean {
    return this._disabled
  }

  /**
   * Returns a boolean indicating whether the control is dirty or not.
   * The control is dirty if the user has changed the value in the UI.
   *
   * @return {boolean} - True if the control is dirty, false otherwise.
   *
   * @public
   */
  public get dirty(): boolean {
    return this._dirty
  }

  /**
   * Returns the array of validation errors for this control.
   * Every error in the array is a message returned by the specific validator
   * function provided to the control
   *
   * @return {ValidationError[]} The array of validation errors.
   *
   * @public
   */
  public get errors(): ValidationError[] {
    return this._errors
  }

  /**
   * Returns the array of validators for this control.
   *
   * @return {Validator<ControlValue>[]} The array of validators.
   *
   * @public
   */
  public get validators(): Validator<ControlValue>[] {
    return this._validators
  }

  /**
   * Subscribes to an event emitted by the control and executes the provided function
   * when the event is triggered.
   *
   * @param event - The event key to subscribe to.
   * @param fn - The function to execute when the event is triggered.
   * @return {Subscription} - A subscription object that can be used to unsubscribe from the event.
   *
   * @event change - The event is triggered when state of the control changes (value, status,
   * touched, dirty, disabled).
   * @event valuechange - The event that is triggered when the value of the control changes.
   * @event touchedchange - The event that is triggered when the control is touched.
   * @event statuschange - The event that is triggered when the status of the control changes.
   * @event disabledchange - The event that is triggered when the disabled state of the control changes.
   * @event pristinechange - The event that is triggered when the dirty state of the control changes.
   *
   * @public
   */
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

  /**
   * Adds the given validators to the list of validators for this control.
   * Validators is executed then value changes and used to check is the control is
   * valid or not
   *
   * The validators will be executed in the order in which they were added.
   *
   * @param validators - The validators to add.
   * @param options - Configuration options determine how the control
   *  propagates changes and emits events after updates and validity checks are applied.
   * * `onlySelf`: When true, only update this control. When false or not supplied,
   * update all direct ancestors. Default is false.
   * * `emitEvent`: When true or not supplied (the default), the `valuechange` and `statuschange`
   * events are fired with the latest status and value when the control is updated.
   * When false, no events are emitted.
   * @return {void}
   *
   * @public
   */
  public addValidators(validators: Validator<ControlValue>[], options: EventOptions = {}): void {
    validators.forEach((validator) => this._validators.push(validator))
    this._updateValueAndStatus(options)
  }

  /**
   * Removes the given validators from the list of validators for the control.
   *
   * @param validators - The validators to remove.
   * @param options - Configuration options determine how the control
   *  propagates changes and emits events after updates and validity checks are applied.
   * * `onlySelf`: When true, only update this control. When false or not supplied,
   * update all direct ancestors. Default is false.
   * * `emitEvent`: When true or not supplied (the default), the `valuechange` and `statuschange`
   * events are fired with the latest status and value when the control is updated.
   * When false, no events are emitted.
   * @return {void}
   *
   * @public
   */
  public removeValidators(validators: Validator<ControlValue>[], options: EventOptions = {}): void {
    this._validators = this._validators.filter((validator) => !validators.includes(validator))
    this._updateValueAndStatus(options)
  }

  /**
   * Sets the validators for the control.
   *
   * @param {Validator<ControlValue>[]} validators - Array of validators to set.
   * @param options - Configuration options determine how the control
   *  propagates changes and emits events after updates and validity checks are applied.
   * * `onlySelf`: When true, only update this control. When false or not supplied,
   * update all direct ancestors. Default is false.
   * * `emitEvent`: When true or not supplied (the default), the `valuechange` and `statuschange`
   * events are fired with the latest status and value when the control is updated.
   * When false, no events are emitted.
   * @return {void}
   *
   * @public
   */
  public setValidators(validators: Validator<ControlValue>[], options: EventOptions = {}): void {
    this._validators = validators
    this._updateValueAndStatus(options)
  }

  /**
   * Removes all validators from the list of validators for the control.
   *
   * @param options - Configuration options determine how the control
   *  propagates changes and emits events after updates and validity checks are applied.
   * * `onlySelf`: When true, only update this control. When false or not supplied,
   * update all direct ancestors. Default is false.
   * * `emitEvent`: When true or not supplied (the default), the `valuechange` and `statuschange`
   * events are fired with the latest status and value when the control is updated.
   * When false, no events are emitted.
   * @return {void}
   *
   * @public
   */
  public clearValidators(options: EventOptions = {}): void {
    this._validators = []
    this._updateValueAndStatus(options)
  }

  /**
   * Sets the disabled state of the control to true and triggers the `disabledchange`
   * event if the control was previously enabled and the `emitEvent` option is set to `true`.
   *
   * @param options - Configuration options determine how the control
   *  propagates changes and emits events after disabled checks are applied.
   * * `emitEvent`: When true or not supplied (the default), the `disabledchange`
   * event is fired after the _disabled property is updated.
   * When false, no events are emitted.
   * @return {void}
   *
   * @public
   */
  public disable({ emitEvent } = { emitEvent: true }): void {
    const change = this._disabled === false

    this._disabled = true

    if (change && emitEvent) {
      this._events.set(new DisabledChangeEvent(this._disabled, this))
    }
  }

  /**
   * Sets the disabled state of the control to false and triggers the `disabledchange` event
   * if the control was previously disabled and the `emitEvent` option is set to `true`.
   *
   * @param options - Configuration options determine how the control
   *  propagates changes and emits events after disabled checks are applied.
   * * `emitEvent`: When true or not supplied (the default), the `disabledchange`
   * event is fired after the _disabled property is updated.
   * When false, no events are emitted.
   * @return {void}
   *
   * @public
   */
  public enable({ emitEvent } = { emitEvent: true }): void {
    const change = this._disabled === true

    this._disabled = false

    if (change && emitEvent) {
      this._events.set(new DisabledChangeEvent(this._disabled, this))
    }
  }

  /**
   * Sets the touched state of the control to true and triggers the `touchedchange` event
   * if the control was previously untouched and the `emitEvent` option is set to `true`.
   *
   * @param options - Configuration options determine how the control
   *  propagates changes and emits events after touched checks are applied.
   * * `onlySelf`: When true, only update this control. When false or not supplied,
   * update all direct ancestors. Default is false.
   * * `emitEvent`: When true or not supplied (the default), the `touchedchange`
   * event is fired with the latest tocuhed state when the control is updated.
   * When false, no events are emitted.
   * @return {void} This function does not return anything.
   *
   * @public
   */
  public markAsTouched(options?: EventOptions): void
  /** @internal */
  public markAsTouched<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void
  public markAsTouched<T extends AbstractControl<any>>(options: InternalEventOptions<T> = {}): void {
    this._updateTouched(true, options)
  }

  /**
   * Sets the touched state of the control to false and triggers the `touchedchange` event
   * if the control was previously touched and the `emitEvent` option is set to `true`.
   *
   * @param options - Configuration options determine how the control
   *  propagates changes and emits events after touched checks are applied.
   * * `onlySelf`: When true, only update this control. When false or not supplied,
   * update all direct ancestors. Default is false.
   * * `emitEvent`: When true or not supplied (the default), the `touchedchange`
   * event is fired with the latest tocuhed state when the control is updated.
   * When false, no events are emitted.
   * @return {void} This function does not return anything.
   *
   * @public
   */
  public markAsUntouched(options?: EventOptions): void
  /** @internal */
  public markAsUntouched<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void
  public markAsUntouched<T extends AbstractControl<any>>(options: InternalEventOptions<T> = {}): void {
    this._updateTouched(false, options)
  }

  /**
   * Sets the dirty state of the control to true and triggers the `pristinechange` event
   * if the control was previously pristine and the `emitEvent` option is set to `true`.
   *
   * @param options - Configuration options determine how the control
   *  propagates changes and emits events after dirty checks are applied.
   * * `onlySelf`: When true, only update this control. When false or not supplied,
   * update all direct ancestors. Default is false.
   * * `emitEvent`: When true or not supplied (the default), the `pristinechange`
   * event is fired with the latest dirty state when the control is updated.
   * When false, no events are emitted.
   * @return {void} This function does not return anything.
   *
   * @public
   */
  public markAsDirty(options?: EventOptions): void
  /** @internal */
  public markAsDirty<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void
  public markAsDirty<T extends AbstractControl<any>>(options: InternalEventOptions<T> = {}): void {
    this._updateDirty(true, options)
  }

  /**
   * Sets the dirty state of the control to false and triggers the `pristinechange` event
   * if the control was previously dirty and the `emitEvent` option is set to `true`.
   *
   * @param options - Configuration options determine how the control
   *  propagates changes and emits events after dirty checks are applied.
   * * `onlySelf`: When true, only update this control. When false or not supplied,
   * update all direct ancestors. Default is false.
   * * `emitEvent`: When true or not supplied (the default), the `pristinechange`
   * event is fired with the latest dirty state when the control is updated.
   * When false, no events are emitted.
   * @return {void} This function does not return anything.
   *
   * @public
   */
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
    this._status = isValid ? 'VALID' : 'INVALID'
  }

  public abstract setValue(value: ControlValue, options?: EventOptions): void
  public abstract reset(options: EventOptions): void
  /** @internal */
  protected abstract _validate(): boolean

  /** @internal */
  protected _updateValue?(): void
}
