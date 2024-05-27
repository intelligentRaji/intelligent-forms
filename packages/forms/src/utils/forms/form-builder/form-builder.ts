import { AbstractControl } from '@/model/abstract'
import { ControlContainer, ControlValueAccessor } from '@/model/interfaces'
import { Validator } from '@/model/types'
import { FormControl } from '../form-control/form-control'
import { FormGroup } from '../form-group/form-group'

type GroupParams = {
  [key: string]:
    | [...ConstructorParameters<typeof FormControl<any>>]
    | ControlContainer<any>
    | GroupParams
    | AbstractControl<any>
}

type FormGroupFromProps<T extends GroupParams> = FormGroup<{
  [K in keyof T]: T[K] extends GroupParams | undefined
    ? FormGroupFromProps<T[K]>
    : T[K] extends [...ConstructorParameters<typeof FormControl<any>>] | undefined
    ? FormControl<T[K][0]>
    : T[K] extends ControlContainer<any> | undefined
    ? T[K]['control']
    : T[K] extends AbstractControl<any> | undefined
    ? T[K]
    : never
}>

/**
 * The helper class that provides the easier interface to create FormGroup and
 * FormControl classes.
 *
 * @public
 */
class FormBuilder {
  /**
   * Creates a new `FormGroup` from the provided controls.
   *
   * @param controls - The object there keys are names of the controls context and
   * values are one of this possible structures:
   * * Class inherited from AbstractControl. In this case the class becomes a child
   * of the FormGroup to be created.
   * * Array, where the first element is the initial value of the control and second is
   * an array of validators of the control to be created. In this case the new FormControl
   * will be created using the values of the array.
   * * Class that implements `ControlContainer` interface. In this case the control
   * that will be applied to the FormGroup will be the `control` property of the class.
   * * Object that matches the structure of the `FormBuilder.group()` params. In this case
   * the nested FormGroup will be created using the values of the object.
   * @returns {FormGroupFromProps<T>} - The created FormGroup.
   *
   * @public
   */
  public group<T extends GroupParams>(controls: T): FormGroupFromProps<T> {
    return new FormGroup(
      Object.entries(controls).reduce<Record<string, any>>((acc, [key, control]) => {
        if (Array.isArray(control)) {
          acc[key] = new FormControl(...control)
        } else if (control instanceof AbstractControl) {
          acc[key] = control
        } else if (control.control) {
          acc[key] = control.control
        } else if (typeof control === 'object') {
          acc[key] = this.group(control as GroupParams)
        }

        return acc
      }, {}),
    ) as FormGroupFromProps<T>
  }

  /**
   * Creates a new `FormControl` instance with the given initial value and optional validators.
   * If an element is provided, the control is registered to the element.
   *
   * @param initialValue - The initial value of the control.
   * @param validators - An optional array of validators to apply to the control.
   * @param element - An optional element to register the control to.
   * @return {FormControl<T>} The created FormControl instance.
   */
  public control<T>(initialValue: T, validators?: Validator<T>[]): FormControl<T>
  public control<T>(initialValue: T, validators?: Validator<T>[], element?: ControlValueAccessor<T>): FormControl<T>
  public control<T>(initialValue: T, validators?: Validator<T>[], element?: ControlValueAccessor<T>): FormControl<T> {
    const control = new FormControl(initialValue, validators)

    if (element) {
      control.register(element)
    }

    return control
  }
}

export const formBuilder = new FormBuilder()
