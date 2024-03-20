import { ValidationError } from '@/types/validation-error.type'
import { Validator } from '@/types/validator.type'
import { BaseComponent, Props } from '@/utils/base-component'
import { Subject } from '@/utils/subject'
import { AbstractControlInterface } from './abstract-control.interface'

type ControlTags = 'input' | 'select' | 'button' | 'textarea' | 'option'

export interface AbstractControlProps<ControlValue, ControlTag extends ControlTags>
  extends Omit<Props<ControlTag>, 'tag' | 'text' | 'id'> {
  tag: ControlTag
  inititialValue: ControlValue
  validators?: Record<string, Validator>
}

class BadImplementedControlValueError extends Error {
  constructor() {
    super(
      // eslint-disable-next-line max-len
      'BAD IMPLEMENTATION: If a class inheriting from AbstractControl has a value type other than string, it must implement methods "ControlValueToNodeValue" and "NodeValueToControlValue"',
    )
  }
}

export abstract class AbstractControl<ControlValue, ControlTag extends ControlTags>
  extends BaseComponent<ControlTag>
  implements AbstractControlInterface<ControlValue>
{
  private static id = 0
  protected errors: Record<string, ValidationError> = {}
  protected touched = false
  public valueChanges!: Subject<ControlValue>
  public isValid = new Subject(false)

  constructor({
    tag,
    classes = [],
    parent,
    attributes,
    validators,
    inititialValue,
  }: AbstractControlProps<ControlValue, ControlTag>) {
    super({ tag, classes: ['input', ...classes], parent, attributes })
    this.node.id = String(AbstractControl.id++)
    this.setValue(inititialValue)

    if (validators) {
      Object.entries(validators).forEach(([key, validator]) => {
        this.addListener('input', () => {
          this.errors[key] = validator(this.getNode().value)
        })
      })
    }

    this.addListener('input', () => {
      this.writeValue(this.node.value)

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

  public getValue(): ControlValue {
    return this.valueChanges.getValue()
  }

  public setValue(value: ControlValue): void {
    this.valueChanges.next(value)

    if (typeof value === 'string') {
      this.node.value = value
      return
    }

    if (!this.ControlValueToNodeValue) {
      throw new BadImplementedControlValueError()
    }

    this.node.value = this.ControlValueToNodeValue(value)
  }

  public getErrors(): ValidationError[] {
    return Object.values(this.errors).filter(Boolean)
  }

  private writeValue(value: string): void {
    if (typeof value === typeof this.getValue()) {
      this.valueChanges.next(value as ControlValue)
    }

    if (!this.NodeValueToControlValue) {
      throw new BadImplementedControlValueError()
    }

    this.valueChanges.next(this.NodeValueToControlValue(value))
  }

  public abstract ControlValueToNodeValue?(contolValue: ControlValue): string

  public abstract NodeValueToControlValue?(value: string): ControlValue
}
