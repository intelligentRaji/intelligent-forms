import { OptionalProperties, Validator, DeepPartial } from '@/model/types'
import { AbstractControl, EventOptions, InternalEventOptions } from '@/model/abstract'
import { FormControl } from '../form-control/form-control'

export type Controls = Record<string, AbstractControl<any>>

export type FormGroupValueType<T extends Controls> = {
  [K in keyof T]: T[K] extends FormControl<infer U> | undefined
    ? U
    : T[K] extends FormGroup<infer R> | undefined
    ? FormGroupValueType<R>
    : never
}

/**
 * Tracks the value and validity state of a group of `FormControl` instances.
 *
 * A `FormGroup` aggregates the values of each child `FormControl` into one object,
 * with each control name as the key.  It calculates its status by reducing the status values
 * of its children. For example, if one of the controls in a group is invalid, the entire
 * group becomes invalid.
 *
 * @public
 */
export class FormGroup<C extends Controls = Controls> extends AbstractControl<FormGroupValueType<C>> {
  /** @internal */
  private _controls: C

  /**
   * Constructs a new `FormGroup` instance.
   *
   * @param controls - An object where the keys are names of the controls in the
   * group context and values are controls themselves.
   * @param validators - An array of validators for the form group. The validators recieve
   * the form value as an argument, and can be used to execute validation on several
   * controls at the same time. For example to check that two fields are equal.
   *
   * @public
   */
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
    this._value = this._initialValue
    this._setValidState(this._validate())
  }

  /**
   * Get the controls of the form group (Object there keys are names of the controls
   * in the group context and values are controls themselves).
   *
   * @return {C} The controls of the form group.
   *
   * @public
   */
  public get controls(): C {
    return this._controls
  }

  /**
   * It accepts an object with control names as keys, and matches the values to the
   * correct controls in the group.
   *
   * @param value - The object that matches the structure of the group.
   * @return {void}
   *
   * @public
   */
  public setValue(value: DeepPartial<FormGroupValueType<C>>, options: EventOptions = {}): void {
    Object.entries(value).forEach(([key, controlValue]) => {
      this.controls[key].setValue(controlValue, { emitEvent: options.emitEvent, onlySelf: true })
    })

    this._updateValueAndStatus(options)
  }

  /**
   * Resets the form group by resetting all child controls, marking it as
   * untouched and pristine, and updating the value and status.
   *
   * @param options - Configuration options determine how the control
   *  propagates changes and emits events after updates checks are applied.
   * * `onlySelf`: When true, only update this control. When false or not supplied,
   * update all direct ancestors. Default is false.
   * * `emitEvent`: When true or not supplied (the default), the `valuechange`, `touchedchange`,
   * `disabledchange` and `statuschange` events are fired with the latest values when the control
   * is updated.
   * When false, no events are emitted.
   * @return {void} This function does not return a value.
   *
   * @public
   */
  public reset(options: EventOptions = {}): void {
    this._forEachChild((control) => control.reset({ emitEvent: options.emitEvent, onlySelf: true }))
    this.markAsUntouched(options)
    this.markAsPristine(options)
    this._updateValueAndStatus(options)
  }

  /**
   * Retrieves the control with the specified name from the form group.
   *
   * @param name - The name of the control to retrieve.
   * @return {C[K] | null} The control with the specified name, or null if
   * it does not exist.
   *
   * @public
   */
  public get<K extends keyof C>(name: K): C[K] | null {
    return this.controls[name] || null
  }

  /**
   * Retrieves the name of the control in the form group that corresponds to the
   * given control.
   *
   * @param control - The control for which to retrieve the name.
   * @return {keyof C | null} The name of the control in the form group, or null
   * if the control
   * is not found.
   *
   * @public
   */
  public getControlName(control: AbstractControl<any>): keyof C | null {
    const entry = Object.entries(this.controls).find((pair) => pair.at(1) === control)

    if (!entry) {
      return null
    }

    return entry.at(0) as keyof C
  }

  /**
   * Checks if the FormGroup contains the specified control or control name.
   *
   * @param nameOrControl - The control name or control instance to check for.
   * @return {boolean} - True if the FormGroup contains the specified control
   * or control name, false otherwise.
   *
   * @public
   */
  public contains<K extends keyof C>(nameOrControl: K): boolean
  public contains(nameOrControl: AbstractControl<any>): boolean
  public contains(nameOrControl: keyof C | AbstractControl<any>): boolean {
    if (nameOrControl instanceof AbstractControl) {
      return Object.values(this.controls).includes(nameOrControl)
    }

    return !!this.controls[nameOrControl]
  }

  /**
   * Adds a control to the form group, updates the value and status and emits
   * the `valuechange` and `statuschange` events if specified.
   *
   * @param name - The name of the control to add.
   * @param control - The control to add.
   * @param options - Configuration options determine how the control
   *  propagates changes and emits events after update and validity checks are applied.
   * * `emitEvent`: When true or not supplied (the default), the `valuechange` and
   * `statuschange` events are fired with the latest values when the control
   * is updated.
   * When false, no events are emitted.
   * @return {void}
   *
   * @public
   */
  public addControl<K extends keyof C>(name: K, control: C[K], options: { emitEvent?: boolean } = {}): void {
    if (this.controls[name]) {
      return
    }

    this._registerControl(name, control)
    this._updateValueAndStatus(options)
  }

  /**
   * Removes a control from the FormGroup and updates the value and status and
   * emits the `valuechange` and `statuschange` events if specified.
   *
   * @param name - The name of the control to remove.
   * @param options - Configuration options determine how the control
   *  propagates changes and emits events after update and validity checks are applied.
   * * `emitEvent`: When true or not supplied (the default), the `valuechange` and
   * `statuschange` events are fired with the latest values when the control
   * is updated.
   * When false, no events are emitted.
   * @return {void}
   *
   * @public
   */
  public removeControl(name: OptionalProperties<C>, options?: { emitEvent?: boolean }): void
  /** @internal */
  public removeControl(name: keyof C, options?: { emitEvent?: boolean }): void
  public removeControl(name: keyof C, options: { emitEvent?: boolean } = {}): void {
    const control = this.controls[name]
    control._setParent(null)
    delete this.controls[name]
    this._updateValueAndStatus(options)
  }

  /**
   * Replaces a control in the form group with a new control, updates the value
   * and status and emits the `valuechange` and `statuschange` events if specified.
   *
   * @param {K} name - The name of the control to replace.
   *@param options - Configuration options determine how the control
   *  propagates changes and emits events after update and validity checks are applied.
   * * `emitEvent`: When true or not supplied (the default), the `valuechange` and
   * `statuschange` events are fired with the latest values when the control
   * is updated.
   * When false, no events are emitted.
   * @return {void}
   *
   * @public
   */
  public replaceControl<K extends keyof C>(name: K, control: C[K], options: { emitEvent?: boolean } = {}): void {
    this._registerControl(name, control)
    this._updateValueAndStatus(options)
  }

  /**
   * Sets the disabled state of the formGroup and all its children to true and triggers
   * the `disabledchange` event if the control was previously enabled and the `emitEvent`
   * option is set to `true`.
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
  public override disable({ emitEvent } = { emitEvent: true }): void {
    super.disable({ emitEvent })
    this._forEachChild((control) => control.disable({ emitEvent }))
  }

  /**
   * Sets the disabled state of the formGroup and all its children to false and triggers
   * the `disabledchange` event if the control was previously disabled and the `emitEvent`
   * option is set to `true`.
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
  public override enable({ emitEvent } = { emitEvent: true }): void {
    super.enable({ emitEvent })
    this._forEachChild((control) => control.enable({ emitEvent }))
  }

  /**
   * Sets the touched state of the FormGroup and all its child controls to true and
   * triggers the `touchedchange` event if the control was previously untouched and
   * the `emitEvent` option is set to `true`.
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
  public override markAsTouched(options?: EventOptions): void
  /** @internal */
  public override markAsTouched<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void
  public override markAsTouched<T extends AbstractControl<any>>(options: InternalEventOptions<T> = {}): void {
    super.markAsTouched(options)
    this._forEachChild((control) => control.markAsTouched({ emitEvent: options.emitEvent, onlySelf: true }))
  }

  /**
   * Sets the touched state of the FormGroup and all its child controls to false and
   * triggers the `touchedchange` event if the control was previously touched and
   * the `emitEvent` option is set to `true`.
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
  public override markAsUntouched(options?: EventOptions): void
  /** @internal */
  public override markAsUntouched<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void
  public override markAsUntouched<T extends AbstractControl<any>>(options: InternalEventOptions<T> = {}): void {
    super.markAsUntouched(options)
    this._forEachChild((control) => control.markAsUntouched({ emitEvent: options.emitEvent, onlySelf: true }))
  }

  /**
   * Sets the dirty state of the FormGroup and all its child controls to true and
   * triggers the `pristinechange` event if the control was previously pristine and
   * the `emitEvent` option is set to `true`.
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
  public override markAsDirty(options?: EventOptions): void
  /** @internal */
  public override markAsDirty<T extends AbstractControl<any>>(options: InternalEventOptions<T>): void
  public override markAsDirty<T extends AbstractControl<any>>(options: InternalEventOptions<T> = {}): void {
    super.markAsDirty(options)
    this._forEachChild((control) => control.markAsDirty({ emitEvent: options.emitEvent, onlySelf: true }))
  }

  /**
   * Sets the dirty state of the FormGroup and all its child controls to false and
   * triggers the `pristinechange` event if the control was previously dirty and
   * the `emitEvent` option is set to `true`.
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

    if (Object.values(this.controls).some((control) => !control.valid) || errors.length > 0) {
      return false
    }

    return true
  }

  /** @internal */
  protected _updateValue(): void {
    this._value = this._reduceValue()
  }

  /** @internal */
  private _forEachChild(fn: (control: AbstractControl<any>) => void): void {
    Object.values(this.controls).forEach(fn)
  }

  /** @internal */
  private _reduceValue(): FormGroupValueType<C> {
    return Object.entries(this.controls).reduce<Record<string, any>>((acc, [key, control]) => {
      acc[key] = control.value
      return acc
    }, {}) as FormGroupValueType<C>
  }

  /** @internal */
  private _registerControl<K extends keyof C>(name: K, control: C[K]): void {
    this.controls[name] = control
    control._setParent(this, { onlySelf: true })
  }
}
