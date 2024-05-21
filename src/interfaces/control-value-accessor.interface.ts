export interface ControlValueAccessor<T> {
  onChange(value: T): void
  onTouch(): void
  writeValue(value: T): void
}
