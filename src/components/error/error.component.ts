import './error.component.scss'
import { AbstractControl } from '@/abstract/abstract-control/abstract-control'
import { BaseComponent } from '@/utils/base-component'
import { Subscription } from '@/utils/subject'

export class ErrorComponent extends BaseComponent<'p'> {
  private readonly subs: Subscription[] = []

  constructor(control: AbstractControl<any>, parent?: BaseComponent) {
    super({ tag: 'p', className: 'error', parent, text: '_' })

    control.events.subscribe(() => {
      if (!control.valid && control.dirty && control.touched && !control.disabled) {
        this.setTextContent(control.errors[0])
        this.addClasses('invalid')
        return
      }

      this.removeClasses('invalid')
    })
  }

  public override destroy(): void {
    super.destroy()
    this.subs.forEach((sub) => sub.unsubscribe())
  }
}
