import { ValidationError } from '@/types/validation-error.type'
import { Validator } from '@/types/validator.type'
import { BaseComponent, Props } from '@/utils/base-component'
import { Subject } from '@/utils/subject'

export interface InputComponentProps extends Omit<Props<'input'>, 'tag' | 'text'> {
  validators: Record<string, Validator>
}

export class InputComponent extends BaseComponent<'input'> {
  private errors: Record<string, ValidationError> = {}
  private touched = false
  public isValid = new Subject(false)

  constructor({ classes = [], parent, attributes, validators }: InputComponentProps) {
    super({ tag: 'input', classes: ['input', ...classes], parent, attributes })
    Object.entries(validators).forEach(([key, validator]) => {
      this.addListener('input', () => {
        this.errors[key] = validator(this.getNode().value)
      })
    })

    this.addListener('input', () => {
      if (this.touched && this.getErrors().length) {
        this.isValid.next(false)
        this.addClasses('invalid')
        return
      }

      this.isValid.next(true)
      this.removeClasses('invalid')
    })

    this.addListener('blur', () => {
      this.touched = true
    })
  }

  public getErrors(): ValidationError[] {
    return Object.values(this.errors).filter(() => true)
  }
}
