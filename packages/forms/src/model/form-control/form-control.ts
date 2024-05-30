import { AbstractControl, EventOptions } from '@/abstract-control'
import { Validator, ControlValueAccessor } from '@/types'

/**
 * Tracks the value, validation status, touched state and dirty state of a form control.
 *
 * The type parameter ControlValue represents the value type of the control (`control.value`).
 */
export class FormControl<ControlValue> extends AbstractControl<ControlValue> {
  /** @internal */
  private writeValue?: (value: ControlValue) => void

  /**
   * Constructs a new instance of the FormControl class.
   *
   * @param initialValue - The initial value of the control.
   * @param validators - An optional array of validators to apply to the control.
   * Defaults to an empty array.
   *
   * Validators is executed then value changes and used to check is the control is valid
   * or not
   *
   * This constructor initializes the FormControl instance with the provided initial value and validators.
   *
   * @public
   */
  constructor(initialValue: ControlValue, validators: Validator<ControlValue>[] = []) {
    super(initialValue, validators)
    this.setValue(initialValue, { emitEvent: false, onlySelf: true })
  }

  /**
   * Sets the value of the control, updates its status and emits `valuechange` and `statuschange`
   * events if specified.
   *
   * @param value - The new value to set for the control.
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
  public setValue(value: ControlValue, options: EventOptions = {}): void {
    this._value = value
    this.writeValue?.(this._value)
    this._updateValueAndStatus(options)
  }

  /**
   * Resets the form control by setting its value to the initial value, marking it
   * as untouched and pristine.
   *
   * @param options - Configuration options determine how the control
   *  propagates changes and emits events after updates and validity checks are applied.
   * * `onlySelf`: When true, only update this control. When false or not supplied,
   * update all direct ancestors. Default is false.
   * * `emitEvent`: When true or not supplied (the default), the `valuechange` and `statuschange`
   * events are fired with the latest status and value when the control is updated.
   * When false, no events are emitted.
   * @return {void} This function does not return a value.
   *
   * @public
   */
  public reset(options: EventOptions = {}): void {
    this.setValue(this._initialValue, options)
    this.markAsUntouched(options)
    this.markAsPristine(options)
  }

  /**
   * Registers a ControlValueAccessor with the form control. Overrides the `onTouch`
   * and `onChange` methods of the given class.
   *
   * After registration calling the `onTouch` method of the given class will mark
   * the control as touched. Calling the `onChange` method of the given class will
   * mark the control as dirty, and set the value of the control to the given value.
   *
   * @param element - The class that implements the `ControlValueAccessor` interface.
   * @return {void}
   */
  public register(element: ControlValueAccessor<ControlValue>): void {
    element.writeValue(this._value)
    this.writeValue = element.writeValue.bind(element)

    element.onTouch = this.markAsTouched.bind(this)

    element.onChange = (value: ControlValue): void => {
      this.markAsDirty()
      this._value = value
      this._updateValueAndStatus({})
    }
  }

  /** @internal */
  protected _validate(): boolean {
    const errors = this._validators.flatMap((validator) => {
      const error = validator(this)
      return error ? [error] : []
    })

    this._errors = errors

    return !errors.length
  }
}
