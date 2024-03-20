export interface Props<T extends keyof HTMLElementTagNameMap> {
  tag?: T
  classes?: string[]
  text?: string
  parent?: HTMLElement
  attributes?: Partial<HTMLElementTagNameMap[T]>
}

export class BaseComponent<T extends keyof HTMLElementTagNameMap = 'div'> {
  private destroy$ = new AbortController()
  protected node: HTMLElementTagNameMap[T]

  constructor({ tag, classes = [], text = '', parent, attributes }: Props<T>) {
    this.node = document.createElement(tag ?? 'div') as HTMLElementTagNameMap[T]
    this.addClasses(...classes)
    this.setTextContent(text)

    if (parent) {
      parent.append(this.node)
    }

    if (attributes) {
      Object.entries(attributes).forEach(([attribute, value]) => {
        this.setAttribute(attribute, value)
      })
    }
  }

  public getNode(): HTMLElementTagNameMap[T] {
    return this.node
  }

  public addClasses(...classes: string[]): void {
    this.node.classList.add(...classes)
  }

  public removeClasses(...classes: string[]): void {
    this.node.classList.remove(...classes)
  }

  public setTextContent(text: string): void {
    this.node.textContent = text
  }

  public setAttribute(attribute: string, value: string): void {
    this.node.setAttribute(attribute, value)
  }

  public addListener<K extends keyof HTMLElementEventMap>(
    event: K,
    listener: (event: HTMLElementEventMap[K]) => void,
  ): void {
    this.node.addEventListener(event, listener as EventListener, { signal: this.destroy$.signal })
  }

  public removeListener<K extends keyof HTMLElementEventMap>(
    event: K,
    listener: (event: HTMLElementEventMap[K]) => void,
  ): void {
    this.node.removeEventListener(event, listener as EventListener)
  }

  public destroy(): void {
    this.destroy$.abort()
    this.node.remove()
  }
}
