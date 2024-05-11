import { ElementValueType } from '@/types/element-value.type'
import { Validator } from '@/types/validator.type'
import { AbstractControl, AbstractControlProps } from './abstract-control/abstract-control'

export type FormControlTags = 'input' | 'select' | 'button' | 'textarea' | 'option' | 'meter' | 'progress'

export interface AbstractFormControlProps<ControlValue, ControlTag extends FormControlTags>
  extends AbstractControlProps<ControlValue, ControlTag> {
  tag: ControlTag
  initialValue: ControlValue
  validators?: Validator<ControlValue>[]
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
  ControlTag extends FormControlTags,
  ElementValue extends ElementValueType<HTMLElementTagNameMap[ControlTag]> = ElementValueType<
    HTMLElementTagNameMap[ControlTag]
  >,
> extends AbstractControl<ControlValue, ControlTag> {
  protected override node!: HTMLElementTagNameMap[ControlTag] & { value: ElementValue }

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
    })

    this.addListener('blur', () => {
      this.markAsTouched()
    })
  }

  public setValue(value: ControlValue, options): void {
    this.setControlValue(value)
    this.setNodeValue(value)

    if (options.emitEvent) {
      this.markAsTouched()
    }

    this.validate(value)
  }

  private validate(value: ControlValue): void {
    const errors = this.validators.flatMap((validator) => {
      const error = validator(value)
      return error ? [error] : []
    })

    this.errors = errors

    if (this.isTouched && errors) {
      this.makeInvalid()
      return
    }

    this.makeValid()
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
