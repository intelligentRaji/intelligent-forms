export interface Props<T extends keyof HTMLElementTagNameMap> {
  tag?: T
  classes?: string[]
  text?: string
  parent?: HTMLElement
  attributes?: HTMLElementTagNameMap[T]
}

export class BaseComponent<T extends keyof HTMLElementTagNameMap = 'div'> {
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

  public addListener(event: string, listener: EventListener): void {
    this.node.addEventListener(event, listener)
  }

  public removeListener(event: string, listener: EventListener): void {
    this.node.removeEventListener(event, listener)
  }

  public destroy(): void {
    this.node.remove()
  }
}
