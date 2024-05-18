import { ControlContainer } from '@/interfaces/control-container.interface'
import { AbstractControl } from '@/abstract/abstract-control/abstract-control'
import { Validator } from '@/types/validator.type'
import { FormControl } from '../form-control/form-control'
import { FormGroup } from '../form-group/form-group'

export type GroupParams = {
  [key: string]:
    | [...ConstructorParameters<typeof FormControl<any>>]
    | ControlContainer<any>
    | GroupParams
    | AbstractControl<any>
}

export type FormGroupFromProps<T extends GroupParams> = FormGroup<{
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

class FormBuilder {
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
}

export const formBuilder = new FormBuilder()
