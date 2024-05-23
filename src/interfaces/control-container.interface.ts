import { FormControl } from '@/form/form-control/form-control'

/**
 * T - the type of the value of the control.
 *
 * Class that implements the interface can be used as a value in the
 * controls object of the `FormBuilder.group()` params. If the class used as a value of
 * the controls object, in that case the insert control becomes a child of the
 * `FormGroup` to be created by the `FormBuilder.group()` method.
 */
export interface ControlContainer<T> {
  control: FormControl<T>
}
