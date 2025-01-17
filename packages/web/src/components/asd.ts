import { ControlValueAccessor } from 'intelligent-forms'
import { BaseComponent, Props } from './base-component/base-component'

export class AsdComponent extends BaseComponent<'input'> implements ControlValueAccessor<string> {
  constructor(p: Props<'input'>) {
    super(p)

    this.addListener('input', () => {
      this.onChange(this.node.value)
    })

    this.addListener('blur', () => {
      this.onTouch()
    })
  }

  public onChange(value: string): void {}
  public onTouch(): void {}
  public writeValue(value: string): void {
    this.node.value = value
  }
}
