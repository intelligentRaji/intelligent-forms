export type Tags = keyof HTMLElementTagNameMap

export interface Props<Tag extends Tags> {
  tag?: Tag
  classes?: string[]
  text?: string
  parent?: HTMLElement
  attributes?: Partial<HTMLElementTagNameMap[Tag]>
}

export class BaseComponent<
  Tag extends Tags = 'div',
  Node extends HTMLElementTagNameMap[Tag] = HTMLElementTagNameMap[Tag],
> {
  private destroy$ = new AbortController()
  protected node: Node
  protected children: BaseComponent<Tags>[] = []

  constructor({ tag, classes = [], text = '', parent, attributes }: Props<Tag>) {
    this.node = document.createElement(tag ?? 'div') as Node
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

  public getNode(): Node {
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

  public getAttribute<A extends keyof Node>(attribute: A): Node[A] {
    return this.getNode()[attribute]
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

  public append(...children: BaseComponent<Tags>[]): void {
    children.forEach((child) => {
      this.children.push(child)
      this.node.append(child.getNode())
    })
  }

  public destroy(): void {
    this.children.forEach((child) => child.destroy())
    this.destroy$.abort()
    this.node.remove()
  }
}
