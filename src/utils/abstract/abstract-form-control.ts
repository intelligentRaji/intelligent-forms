import { ElementValueType } from '@/types/element-value.type'
import { ValidationError } from '@/types/validation-error.type'
import { Validator } from '@/types/validator.type'
import { BaseComponent, Props } from '@/utils/base-component'
import { Subject } from '@/utils/subject'

export interface AbstractControlProps<ContolValue, ControlTag> extends AbstractControlProps<ContolValue, ControlTag> {
  tag: ControlTag
  inititialValue: ControlValue
  validators?: Record<string, Validator>
}

class BadImplementedAbstractControlError extends Error {
  constructor() {
    super(
      // eslint-disable-next-line max-len
      'BAD_IMPLEMENTATION: If a class inheriting from AbstractControl has a value type other than string, it must implement "ControlValueAccessor"',
    )
  }
}

export abstract class AbstractFormControl<
  ControlValue,
  ControlTag extends ControlTags,
  ElementValue = ElementValueType<HTMLElementTagNameMap[ControlTag]>,
> extends BaseComponent<ControlTag> {
  private static id = 0
  protected errors: Record<string, ValidationError> = {}
  protected isTouched = false
  public valueChanges: Subject<ControlValue>
  public isValid = new Subject(false)

  constructor({
    tag,
    classes = [],
    parent,
    attributes,
    validators,
    inititialValue,
  }: AbstractControlProps<ControlValue, ControlTag>) {
    super({ tag, classes, parent, attributes })
    this.node.id = String(AbstractControl.id++)

    this.valueChanges = new Subject(inititialValue)
    this.setNodeValue(inititialValue)

    if (validators) {
      Object.entries(validators).forEach(([key, validator]) => {
        this.addListener('input', () => {
          this.errors[key] = validator(this.getValue())
        })
      })
    }

    this.addListener('input', () => {
      this.setControlValue(this.node.value as ElementValue)

      if (this.isTouched && this.getErrors().length) {
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
    this.isTouched = true
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

  public getErrors(): ValidationError[] {
    return Object.values(this.errors).filter(Boolean)
  }

  public setValue(value: ControlValue): void {
    this.setControlValue(value)
    this.setNodeValue(value)
    this.makeTouched()
  }

  private setNodeValue(value: ElementValue | ControlValue): void {
    if (this.isNodeValueSameAsControlValue(value)) {
      this.node.value = value as typeof this.node.value
      return
    }

    if (!this.transformControlValueToNodeValue) {
      throw new BadImplementedAbstractControlError()
    }

    this.node.value = this.transformControlValueToNodeValue(value) as typeof this.node.value
  }

  private setControlValue(value: ElementValue | ControlValue): void {
    if (this.isNodeValueSameAsControlValue(value)) {
      this.valueChanges.next(value)
    }

    if (!this.transformNodeValueToControlValue) {
      throw new BadImplementedAbstractControlError()
    }

    this.valueChanges.next(this.transformNodeValueToControlValue(value))
  }

  private isNodeValueSameAsControlValue(value: ControlValue | ElementValue): value is ControlValue & ElementValue {
    return typeof value === typeof this.getValue()
  }

  public transformControlValueToNodeValue?(contolValue: ControlValue | ElementValue): ElementValue
  public transformNodeValueToControlValue?(value: ElementValue | ControlValue): ControlValue
}
