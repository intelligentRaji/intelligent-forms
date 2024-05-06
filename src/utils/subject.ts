export function isCallable(fn: unknown): fn is CallableFunction {
  return typeof fn === 'function'
}

export class Subject<ListenerType> {
  private value?: ListenerType

  private listeners: ((params: ListenerType) => void)[] = []

  constructor(initialValue?: ListenerType) {
    if (initialValue) {
      this.value = initialValue
    }
  }

  public subscribe(listener: (params: ListenerType) => void, updateData = false): void {
    this.listeners.push(listener)
    if (updateData && this.value) {
      listener(this.value)
    }
  }

  public unsubscribe(listener: (params: ListenerType) => void): void {
    this.listeners = this.listeners.filter((item) => item !== listener)
  }

  public update(callback: (previousValue: ListenerType) => ListenerType): void {
    const { value } = this
    if (value) {
      const updatedValue = callback(value)
      this.value = updatedValue
      this.notify(updatedValue)
    }
  }

  public set(params: ListenerType): void {
    this.value = params
    this.notify(this.value)
  }

  private notify(value: ListenerType): void {
    this.listeners.forEach((listener) => listener(value))
  }
}
