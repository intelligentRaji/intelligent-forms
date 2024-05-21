import './error.component.scss'
import { AbstractControl } from '@/abstract/abstract-control/abstract-control'
import { BaseComponent, Props } from '@/utils/base-component'
import { Subscription } from '@/utils/subject'

export interface ErrorComponentProps extends Omit<Props<'p'>, 'text'> {
  control: AbstractControl<any>
}

export class ErrorComponent extends BaseComponent<'p'> {
  private subs: Subscription[] = []

  constructor(p: ErrorComponentProps) {
    super({ tag: 'p', className: `${p.className} error`, text: '_' })

    const { control } = p

    this.subs.push(
      control.on('change', () => {
        if (!control.valid && control.touched && control.dirty && !control.disabled) {
          this.setTextContent(control.errors[0])
          this.addClasses('invalid')
          return
        }

        this.removeClasses('invalid')
      }),
    )
  }

  public override destroy(): void {
    super.destroy()
    this.subs.forEach((sub) => sub.unsubscribe())
  }
}
