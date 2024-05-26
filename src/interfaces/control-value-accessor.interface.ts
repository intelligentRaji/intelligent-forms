/**
 * T - the type of the value of the control what be conected to the class.
 *
 * Class that implemets the interface can be connected to FormControl.
 * Implement this interface to show the value of the control
 * in the UI.
 */
export interface ControlValueAccessor<T> {
  onChange(value: T): void
  onTouch(): void
  writeValue(value: T): void
}
