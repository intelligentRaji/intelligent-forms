export type Tags = keyof HTMLElementTagNameMap

export type Props<Tag extends Tags> = Partial<
  Omit<HTMLElementTagNameMap[Tag], 'style' | 'classList' | 'children' | 'tagName'>
> & {
  tag?: Tag
  text?: string
  style?: Partial<CSSStyleDeclaration>
  parent?: BaseComponent
}

export class BaseComponent<
  Tag extends Tags = 'div',
  Node extends HTMLElementTagNameMap[Tag] = HTMLElementTagNameMap[Tag],
> {
  private destroy$ = new AbortController()
  protected _node: Node
  protected children: BaseComponent<Tags>[] = []

  constructor(p: Props<Tag>) {
    if (p.text) {
      p.textContent = p.text
    }
    const node = document.createElement(p.tag ?? 'div') as Node
    Object.assign(node, p)
    this._node = node

    if (p.parent) {
      p.parent.append(this)
    }
  }

  public get node(): Node {
    return this._node
  }

  public addClasses(...classes: string[]): void {
    this._node.classList.add(...classes)
  }

  public removeClasses(...classes: string[]): void {
    this._node.classList.remove(...classes)
  }

  public setTextContent(text: string): void {
    this._node.textContent = text
  }

  public setAttribute(attribute: string, value: string): void {
    this._node.setAttribute(attribute, value)
  }

  public getAttribute<A extends keyof Node>(attribute: A): Node[A] {
    return this.node[attribute]
  }

  public addListener<K extends keyof HTMLElementEventMap>(
    event: K,
    listener: (event: HTMLElementEventMap[K]) => void,
  ): void {
    this._node.addEventListener(event, listener as EventListener, { signal: this.destroy$.signal })
  }

  public removeListener<K extends keyof HTMLElementEventMap>(
    event: K,
    listener: (event: HTMLElementEventMap[K]) => void,
  ): void {
    this._node.removeEventListener(event, listener as EventListener)
  }

  public append(...children: BaseComponent<Tags>[]): void {
    children.forEach((child) => {
      this.children.push(child)
      this._node.append(child.node)
    })
  }

  public destroy(): void {
    this.children.forEach((child) => child.destroy())
    this.destroy$.abort()
    this._node.remove()
  }
}
