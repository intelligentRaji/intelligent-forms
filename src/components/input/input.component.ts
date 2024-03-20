import { ValidationError } from '@/types/validation-error.type'
import { Validator } from '@/types/validator.type'
import { BaseComponent, Props } from '@/utils/base-component'
import { Subject } from '@/utils/subject'

export interface InputComponentProps<InputValue> extends Omit<Props<'input'>, 'tag' | 'text'> {
  inititialValue: InputValue
  validators?: Record<string, Validator>
}

export class InputComponent<InputValue> extends BaseComponent<'input'> {
  private errors: Record<string, ValidationError> = {}
  private touched = false
  public valueChanges!: Subject<InputValue>
  public isValid = new Subject(false)

  constructor({ classes = [], parent, attributes, validators, inititialValue }: InputComponentProps<InputValue>) {
    super({ tag: 'input', classes: ['input', ...classes], parent, attributes })
    this.setValue(inititialValue)

    if (validators) {
      Object.entries(validators).forEach(([key, validator]) => {
        this.addListener('input', () => {
          this.errors[key] = validator(this.getNode().value)
        })
      })
    }

    this.addListener('input', () => {
      this.setValue(this.node.value as InputValue)
      if (this.touched && this.getErrors().length) {
        this.makeInvalid()
        return
      }

      this.makeValid()
    })

    this.addListener('blur', () => {
      this.makeTouched()
    })
  }

  public makeTouched(): void {
    this.touched = true
  }

  public makeInvalid(): void {
    this.isValid.next(false)
    this.addClasses('invalid')
  }

  public makeValid(): void {
    this.isValid.next(true)
    this.removeClasses('invalid')
  }

  public getValue(): InputValue {
    return this.valueChanges.getValue()
  }

  public setValue(value: InputValue): void {
    this.valueChanges.next(value)
    this.node.value = String(value)
  }

  public getErrors(): ValidationError[] {
    return Object.values(this.errors).filter(Boolean)
  }
}
