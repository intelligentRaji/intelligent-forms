import { ValidationError } from '@/types/validation-error.type'
import { Validator } from '@/types/validator.type'
import { BaseComponent, Props, Tags } from '@/utils/base-component'
import { Subject } from '@/utils/subject'

export interface AbstractControlProps<ControlValue, ControlTag extends Tags>
  extends Omit<Props<ControlTag>, 'tag' | 'text' | 'id'> {
  tag: ControlTag
  initialValue: ControlValue
  validators?: Validator<ControlValue>[]
}

export abstract class AbstractControl<ControlValue, ControlTag extends Tags> extends BaseComponent<ControlTag> {
  private static id = 0
  protected initialValue: ControlValue
  protected disabled = false
  protected isTouched = false
  protected errors: ValidationError[] = []
  protected validators: Validator<ControlValue>[]
  public valueChanges$: Subject<ControlValue>
  public statusChanges$ = new Subject(false)

  constructor({
    tag,
    classes = [],
    parent,
    attributes,
    initialValue,
    validators = [],
  }: AbstractControlProps<ControlValue, ControlTag>) {
    super({ tag, classes, parent, attributes })
    this.node.id = String(AbstractControl.id++)
    this.initialValue = initialValue
    this.valueChanges$ = new Subject(initialValue)
    this.validators = validators
  }

  public markAsTouched(): void {
    this.isTouched = true
  }

  public makeInvalid(): void {
    this.statusChanges$.next(false)
    this.addClasses('invalid')
  }

  public makeValid(): void {
    this.statusChanges$.next(true)
    this.removeClasses('invalid')
  }

  public disable(): void {
    this.disabled = true
    this.addClasses('disabled')
  }

  public enable(): void {
    this.disabled = false
    this.removeClasses('disabled')
  }

  public isDisabled(): boolean {
    return this.disabled
  }

  public isValid(): boolean {
    return this.statusChanges$.getValue()
  }

  public getValue(): ControlValue {
    return this.valueChanges$.getValue()
  }

  public getErrors(): ValidationError[] {
    return this.errors
  }

  public reset(): void {
    this.setValue(this.initialValue)
  }

  public addValidators(...validators: Validator<ControlValue>[]): void {
    validators.forEach((validator) => this.validators.push(validator))
  }

  public removeValidators(...validators: Validator<ControlValue>[]): void {
    this.validators = this.validators.filter((validator) => validators.includes(validator))
  }

  public setValidators(validators: Validator<ControlValue>[]): void {
    this.validators = validators
  }

  public clearValidators(): void {
    this.validators = []
  }

  public abstract setValue(value: ControlValue): void
  public abstract clear(): void
}
