import { ElementValueType } from '@/types/element-value.type'
import { Validator } from '@/types/validator.type'
import { AbstractControl, AbstractControlProps } from './abstract-control'

export type FormContolTags = 'input' | 'select' | 'button' | 'textarea' | 'option' | 'meter' | 'progress'
export interface AbstractFormControlProps<ControlValue, ControlTag extends FormContolTags>
  extends AbstractControlProps<ControlValue, ControlTag> {
  tag: ControlTag
  initialValue: ControlValue
  validators?: Validator[]
}

class BadImplementedAbstractFormControlError extends Error {
  constructor() {
    super(
      // eslint-disable-next-line max-len
      'BAD_IMPLEMENTATION: If a class that inherits from AbstractFormControl has a value type other than DOM Element value that represents this control, it must implement "ControlValueTransformer".',
    )
  }
}

export abstract class AbstractFormControl<
  ControlValue,
  ControlTag extends FormContolTags,
  ElementValue = ElementValueType<HTMLElementTagNameMap[ControlTag]>,
> extends AbstractControl<ControlValue, ControlTag> {
  protected override node!: HTMLElementTagNameMap[ControlTag] & { value: ControlValue }

  constructor({
    tag,
    classes = [],
    parent,
    attributes,
    validators,
    initialValue,
  }: AbstractFormControlProps<ControlValue, ControlTag>) {
    super({ tag, classes, parent, attributes, initialValue, validators })
    this.setNodeValue(initialValue)

    this.addListener('input', () => {
      this.setControlValue(this.node.value)
      this.validate(this.getValue())

      if (this.isTouched && this.getErrors().length) {
        this.makeInvalid()
        return
      }

      this.makeValid()
    })

    this.addListener('blur', () => {
      this.markAsTouched()
    })
  }

  public setValue(value: ControlValue): void {
    this.setControlValue(value)
    this.setNodeValue(value)
    this.validate(value)
    this.markAsTouched()
  }

  private validate(value: ControlValue): void {
    this.errors = this.validators.flatMap((validator) => {
      const error = validator(value)
      return error ? [error] : []
    })
  }

  private setNodeValue(value: ElementValue | ControlValue): void {
    if (this.isNodeValueSameAsControlValue(value)) {
      this.node.value = value
      return
    }

    if (!this.transformControlValueToNodeValue) {
      throw new BadImplementedAbstractFormControlError()
    }

    this.node.value = this.transformControlValueToNodeValue(value)
  }

  private setControlValue(value: ElementValue | ControlValue): void {
    if (this.isNodeValueSameAsControlValue(value)) {
      this.valueChanges$.next(value)
    }

    if (!this.transformNodeValueToControlValue) {
      throw new BadImplementedAbstractFormControlError()
    }

    this.valueChanges$.next(this.transformNodeValueToControlValue(value))
  }

  private isNodeValueSameAsControlValue(
    value: ControlValue | ElementValue,
  ): value is ControlValue & ElementValue & ElementValueType<typeof this.node> {
    return typeof value === typeof this.getValue()
  }

  public transformControlValueToNodeValue?(
    contolValue: ControlValue | ElementValue,
  ): ElementValue & ElementValueType<typeof this.node>
  public transformNodeValueToControlValue?(value: ElementValue | ControlValue): ControlValue
}
