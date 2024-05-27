# <p style="text-align: center;">intelligent-forms</p>

### <p style="text-align: center;">_intelligent-forms is a simple library for creating forms on typescript, inspired by [@angular/forms](https://www.npmjs.com/package/@angular/forms)_</p>

<hr style="opacity: 0.15">

## Installation

###

    npm i intelligent-forms

<hr style="opacity: 0.15">

## Features

<hr style="opacity: 0.1; height: 1px">

- ### Typed: The forms are fully typed.
  - Compile-Time Error Checking.
  - Accurate Form Validation.
  - Improved Code Quality.
- ### Flexibility: Designed to adapt to a wide range of use cases and environments.
  - Adaptable API: The library provides a flexible API that can be easily integrated into various projects, regardless of their size or complexity.
  - Configurable Components: Allows developers to configure components to fit specific needs, making it suitable for a variety of applications.
- ### Maintainability: Structured to ensure easy updates, debugging, and long-term maintenance.
  - Clean Codebase: Follows best practices and coding standards, making it easier to read and understand.
- ### Reusability: Components are modular and reusable across different projects and applications.
  - Extensible Design: Built with extensibility in mind, allowing developers to extend functionality without modifying the core library.

<hr style="opacity: 0.15">

## Usage

<hr style="opacity: 0.1; height: 1px">

```ts
import { formBuilder } from 'intelligent-forms'

// Creating a class that implements ControlValueAccessor<ControlValue>
export class InputComponent implements ControlValueAccessor<string> {
  public node: HTMLInputElement

  constructor() {
    this.node = document.createElement('input')

    this.node.addEventListener('input', () => {
      /** 
       * Call the method on input event to mark linked control as `dirty`
       * and change the value of the linked control
       */
      this.onChange(this.node.value)
    })

    this.node.addEventListener('blur', () => {
      // Call the method on blur event to mark linked control as `touched`
      this.onTouch()
    })
  }

  // Forms API overrids this method, so you dont need to define it
  public onChange(value: string): void {}
  // Forms API overrids this method, so you dont need to define it
  public onTouch(): void {}

  /**
   * Forms API using this method to write the value of the linked 
   * control to our class
   */
  public writeValue(value: string): void {
    this.node.value = value
  }
}


// Create the validator to validate the value a control
function capitalizeValidator(control) {
  return (/^[A-Z].*$/.test(control.value) ? null : 'message to show to the user in case of invalid value')
}


const name = new InputComponent()
const surname = new InputComponent()

/**
 * Create the FormGroup with FormContols and bind the classes that
 * implements ControlValueAccessor via FormBuilder.control() method, 
 * passing the classes as the third parameter
 */
const form = formBuilder.group({
  name: formBuilder.control('', [], name),
  surmae: formBuilder.control('', [capitalizeValidator], surname),
})

const root = document.getElementById('app')
root?.append(name.node, surname.node)
```

<hr style="opacity: 0.15">

## Documentation

<hr style="opacity: 0.1; height: 1px">

### `AbstractControl<ControlValue>`
**Base class from which FormControl and FormGroup are inherited**

| Field       | Description    | Returned values | Initial value |
|-------------|----------------|-----------------|---------------|
| `value`    | current value of the control | `ControlValue` | `ControlValue` |
| `touched` | True if the control is marked as touched. A control is marked touched once the user has triggered a blur event on it. | `boolean` | `false`
| `valid` | A control is valid when its status is `'VALID'`. | `boolean` | **depends on initial value**
| `status`  | The validation status of the control. Status = `'VALID'` when control value passed all the validation connected to it. | `'VALID'` `'INVALID'` | **depends on initial value**
| `disabled` | Returns a boolean indicating whether the control is disabled or not. True if the control is disabled, false otherwise. | `boolean` | `false`
| `dirty` | True if the control is dirty, false otherwise. The control is dirty if the user has changed the value in the UI. | `boolean` | `false`
| `errors` | Returns the array of validation errors for this control. Every error in the array is a message returned by the specific validator function provided to the control. | `ValidationError[]` | **depends on initial value and given validators**
| `validators` | Returns the array of validators for this control. | `Validator<ControlValue>[]` | **depends on given validators**
| `on()` | Subscribes to an event emitted by the control and executes the provided function when the event is triggered. | `void`
| `addValidators()` | Adds the given validators to the list of validators for this control. Validators is executed then value changes and used to check is the control is valid or not. | `void`
| `removeValidators()` | Removes the given validators from the list of validators for the control. | `void`
| `setValidators()` | Sets the validators for the control. | `void`
| `clearValidators()` | Removes all validators from the list of validators for the control. | `void`
| `disable()` | Sets the disabled state of the control to true and triggers the `disabledchange` event if the control was previously enabled and the `emitEvent` option is set to `true`. | `void`
| `enable()` | Sets the disabled state of the control to false and triggers the `disabledchange` event if the control was previously disabled and the `emitEvent` option is set to `true`. | `void`
| `markAsTouched()` | Sets the touched state of the control to true and triggers the `touchedchange` event if the control was previously untouched and the `emitEvent` option is set to `true`. | `void`
| `markAsUntouched()` | Sets the touched state of the control to false and triggers the `touchedchange` event if the control was previously touched and the `emitEvent` option is set to `true`. | `void`
| `markAsDirty()` | Sets the dirty state of the control to true and triggers the `pristinechange` event if the control was previously pristine and the `emitEvent` option is set to `true`. | `void`
| `markAsPristine()` | Sets the dirty state of the control to false and triggers the `pristinechange` event if the control was previously dirty and the `emitEvent` option is set to `true`. | `void`

### `FormControl<ControlValue>`
**Tracks the value, validation status, touched state and dirty state of a form control. <span style="font-weight: 800">_Inherited from `AbstractControl`_</span>**

| Field       | Description    | Returned values |
|-------------|----------------|-----------------|
| `setValue()`    | Sets the value of the control, updates its status and emits `valuechange` and `statuschange` | `void` |
| `reset()` | esets the form control by setting its value to the initial value, marking it as untouched and pristine. | `void`
| `register()` | Registers the class that implements the `ControlValueAccessor` interface. with the form control. Overrides the `onTouch` and `onChange` methods of the given class. | `void`

### `FormGroup<Controls = Record<string, AbstractControl>>`
**Tracks the value and validity state of a group of `FormControl` instances. A `FormGroup` aggregates the values of each child `FormControl` into one object, with each control name as the key.  It calculates its status by reducing the status values of its children. For example, if one of the controls in a group is invalid, the entire group becomes invalid. <span style="font-weight: 800">_Inherited from `AbstractControl`_</span>**

| Field       | Description    | Returned values | Initial value |
|-------------|----------------|-----------------|---------------|
| `controls` | Get the controls of the form group (Object there keys are names of the controls in the group context and values are controls themselves). | `Controls` | **depends on given controls**
| `setValue()` | It accepts an object with control names as keys, and matches the values to the correct controls in the group. | `void`
| `reset()` | Resets the form group by resetting all child controls, marking it as untouched and pristine, and updating the value and status. | `void`
| `get()` | Retrieves the control with the specified name from the form group. | `AbstractControl`
| `getControlName()` | Retrieves the name of the control in the form group that corresponds to the given control. | `keyof Controls`
| `contains()` | Checks if the FormGroup contains the specified control or control name. | `boolean`
| `addControl()` | Adds a control to the form group, updates the value and emits the `valuechange` and `statuschange` events if specified. | `void`
| `removeControl()` | Removes a control from the FormGroup and updates the value and status and emits the `valuechange` and `statuschange` events if specified. | `void`
| `replaceControl()` | Replaces a control in the form group with a new control, updates the value and status and emits the `valuechange` and `statuschange` events if specified. | `void`
| `disable()` | Sets the disabled state of the formGroup and all its children to true and triggers the `disabledchange` event if the control was previously enabled and the `emitEvent` option is set to `true`. | `void`
| `enable()` | Sets the disabled state of the formGroup and all its children to false and triggers the `disabledchange` event if the control was previously disabled and the `emitEvent` option is set to `true`. | `void`
| `markAsTouched()` | Sets the touched state of the FormGroup and all its child controls to true and triggers the `touchedchange` event if the control was previously untouched and the `emitEvent` option is set to `true`. | `void`
| `markAsUntouched()` | Sets the touched state of the FormGroup and all its child controls to false and triggers the `touchedchange` event if the control was previously touched and the `emitEvent` option is set to `true`. | `void`
| `markAsDirty()` | Sets the dirty state of the FormGroup and all its child controls to true and triggers the `pristinechange` event if the control was previously pristine and the `emitEvent` option is set to `true`. | `void`
| `markAsPristine()` | Sets the dirty state of the FormGroup and all its child controls to false and triggers the `pristinechange` event if the control was previously dirty and the `emitEvent` option is set to `true`. | `void`

### `formBuilder`
**The helper class that provides the easier interface to create FormGroup and FormControl classes.**

| Field       | Description    | Returned values |
|-------------|----------------|-----------------|
| `group()` | Creates a new FormGroup from the object there keys are names of the controls and values are one of this possible structures: **<ul><li>Class inherited from `AbstractControl`.** In this case the class becomes a child of the FormGroup to be created.</li> **<li>Array - where the first element is the initial value of the control and second is an array of validators of the control to be created.** In this case the new FormControl will be created using the values of the array.</li> **<li>Class that implements `ControlContainer` interface.** In this case the control that will be applied to the FormGroup will be the `control` property of the class.</li> **<li>Object that matches the structure of the `FormBuilder.group()` params.** In this case the nested FormGroup will be created using the values of the object.</li></ul> | `FormGroup`
| `control()` | Creates a new `FormControl` instance with the given initial value and optional validators. If an element is provided, the control is registered to the element. | `FormControl`