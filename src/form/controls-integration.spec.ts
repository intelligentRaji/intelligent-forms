import { beforeEach, describe, expect, it, vi } from 'vitest'
import { capitalizeValidator } from '@/validators/capitalize.validator'
import {
  DisabledChangeEvent,
  PristineChangeEvent,
  StatusChangeEvent,
  TouchedChangeEvent,
  ValueChangeEvent,
} from '@/abstract/abstract-control/abstract-control'
import { requiredValidator } from '@/validators/required.validator'
import { FormGroup } from './form-group/form-group'
import { FormControl } from './form-control/form-control'

describe('FormControl', () => {
  describe('setValue()', () => {
    const value = {
      name: 'Halib',
      surname: 'Kashmiri',
      age: 22,
    }

    const newValue = 'test'

    let form: FormGroup<{
      name: FormControl<string>
      surname?: FormControl<string>
      age: FormControl<number>
    }>

    let control: FormControl<string>

    beforeEach(() => {
      control = new FormControl<string>(value.name, [capitalizeValidator('test')])

      form = new FormGroup<{
        name: FormControl<string>
        surname?: FormControl<string>
        age: FormControl<number>
      }>({ name: control, surname: new FormControl(value.surname), age: new FormControl(value.age) })
    })

    it('Should update parent FormGroup value', () => {
      expect(form.value).toStrictEqual(value)

      control.setValue(newValue)

      expect(form.value).toStrictEqual({ ...value, name: newValue })
    })

    it('Should not update parent FromGroup value if options object with onlySelf parameter set to true was passed into the parameters', () => {
      expect(form.value).toStrictEqual(value)

      control.setValue(newValue, { onlySelf: true })

      expect(form.value).toStrictEqual(value)
    })

    it('Should call parent FromGroup ValueChangeEvent and StatusChangeEvent if no options object was passed into the parameters', () => {
      const onChange = vi.fn()
      const onStatus = vi.fn()

      expect(form.value).toStrictEqual(value)
      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof ValueChangeEvent) {
          onChange()
        }

        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      control.setValue(newValue)

      expect(onChange).toBeCalledTimes(1)
      expect(onStatus).toBeCalledTimes(1)
      expect(form.value).toStrictEqual({ ...value, name: newValue })
    })

    it('Should not call parent FromGroup ValueChangeEvent and StatusChangeEvent if options object with onlySelf parameter set to true was passed into the parameters', () => {
      const onChange = vi.fn()
      const onStatus = vi.fn()

      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof ValueChangeEvent) {
          onChange()
        }

        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      control.setValue(newValue, { onlySelf: true })

      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)
    })
  })

  describe('reset()', () => {
    const initialValue = {
      name: 'Halib',
      surname: 'Kashmiri',
      age: 22,
    }

    const newValue = 'test'

    let form: FormGroup<{
      name: FormControl<string>
      surname?: FormControl<string>
      age: FormControl<number>
    }>

    let control: FormControl<string>

    beforeEach(() => {
      control = new FormControl<string>(initialValue.name, [capitalizeValidator('test')])

      form = new FormGroup<{
        name: FormControl<string>
        surname?: FormControl<string>
        age: FormControl<number>
      }>({ name: control, surname: new FormControl(initialValue.surname), age: new FormControl(initialValue.age) })
    })

    it('Should update parent FormGroup value', () => {
      control.setValue(newValue)

      expect(form.value).toStrictEqual({ ...initialValue, name: newValue })

      control.reset()

      expect(form.value).toStrictEqual(initialValue)
    })

    it('Should not update parent FromGroup value if options object with onlySelf parameter set to true was passed into the parameters', () => {
      control.setValue(newValue)

      expect(form.value).toStrictEqual({ ...initialValue, name: newValue })

      control.reset({ onlySelf: true })

      expect(form.value).toStrictEqual({ ...initialValue, name: newValue })
    })

    it('Should call parent FromGroup ValueChangeEvent and StatusChangeEvent if no options object was passed into the parameters', () => {
      const onChange = vi.fn()
      const onStatus = vi.fn()

      control.setValue(newValue)

      expect(form.value).toStrictEqual({ ...initialValue, name: newValue })
      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof ValueChangeEvent) {
          onChange()
        }

        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      control.reset()

      expect(onChange).toBeCalledTimes(1)
      expect(onStatus).toBeCalledTimes(1)
      expect(form.value).toStrictEqual(initialValue)
    })

    it('Should not call parent FromGroup ValueChangeEvent and StatusChangeEvent if options object with onlySelf parameter set to true was passed into the parameters', () => {
      const onChange = vi.fn()
      const onStatus = vi.fn()

      control.setValue(newValue)

      expect(form.value).toStrictEqual({ ...initialValue, name: newValue })
      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof ValueChangeEvent) {
          onChange()
        }

        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      control.reset({ onlySelf: true })

      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)
      expect(form.value).toStrictEqual({ ...initialValue, name: newValue })
    })
  })

  describe('addValidators()', () => {
    const value = {
      name: 'halib',
      surname: 'Kashmiri',
      age: 22,
    }

    let form: FormGroup<{
      name: FormControl<string>
      surname?: FormControl<string>
      age: FormControl<number>
    }>

    let control: FormControl<string>

    beforeEach(() => {
      control = new FormControl<string>(value.name)

      form = new FormGroup<{
        name: FormControl<string>
        surname?: FormControl<string>
        age: FormControl<number>
      }>({ name: control, surname: new FormControl(value.surname), age: new FormControl(value.age) })
    })

    it('Should update the parent FormGroup status if no options object was passed into the parameters', () => {
      expect(form.valid).toBeTruthy()

      control.addValidators([capitalizeValidator('test')])

      expect(form.valid).toBeFalsy()
    })

    it('Should not update the parent FormGroup status if options object with onlySelf parameter set to true was passed into the parameters', () => {
      expect(form.valid).toBeTruthy()

      control.addValidators([capitalizeValidator('test')], { onlySelf: true })

      expect(form.valid).toBeTruthy()
    })

    it('Should call parent FromGroup ValueChangeEvent and StatusChangeEvent if no options object was passed into the parameters', () => {
      const onChange = vi.fn()
      const onStatus = vi.fn()

      expect(form.valid).toBeTruthy()
      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof ValueChangeEvent) {
          onChange()
        }

        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      control.addValidators([capitalizeValidator('test')])

      expect(onChange).toBeCalledTimes(1)
      expect(onStatus).toBeCalledTimes(1)
      expect(form.valid).toBeFalsy()
    })

    it('Should not call parent FromGroup ValueChangeEvent and StatusChangeEvent if options object with onlySelf parameter set to true was passed into the parameters', () => {
      const onChange = vi.fn()
      const onStatus = vi.fn()

      expect(form.valid).toBeTruthy()
      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof ValueChangeEvent) {
          onChange()
        }

        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      control.addValidators([capitalizeValidator('test')], { onlySelf: true })

      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)
      expect(form.valid).toBeTruthy()
    })
  })

  describe('removeValidators()', () => {
    const value = {
      name: 'halib',
      surname: 'Kashmiri',
      age: 22,
    }

    const validator = capitalizeValidator('test')

    let form: FormGroup<{
      name: FormControl<string>
      surname?: FormControl<string>
      age: FormControl<number>
    }>

    let control: FormControl<string>

    beforeEach(() => {
      control = new FormControl<string>(value.name, [validator])

      form = new FormGroup<{
        name: FormControl<string>
        surname?: FormControl<string>
        age: FormControl<number>
      }>({ name: control, surname: new FormControl(value.surname), age: new FormControl(value.age) })
    })

    it('Should update the parent FormGroup status if no options object was passed into the parameters', () => {
      expect(form.valid).toBeFalsy()

      control.removeValidators([validator])

      expect(form.valid).toBeTruthy()
    })

    it('Should not update the parent FormGroup status if options object with onlySelf parameter set to true was passed into the parameters', () => {
      expect(form.valid).toBeFalsy()

      control.removeValidators([validator], { onlySelf: true })

      expect(form.valid).toBeFalsy()
    })

    it('Should call parent FromGroup ValueChangeEvent and StatusChangeEvent if no options object was passed into the parameters', () => {
      const onChange = vi.fn()
      const onStatus = vi.fn()

      expect(form.valid).toBeFalsy()
      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof ValueChangeEvent) {
          onChange()
        }

        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      control.removeValidators([validator])

      expect(onChange).toBeCalledTimes(1)
      expect(onStatus).toBeCalledTimes(1)
      expect(form.valid).toBeTruthy()
    })

    it('Should not call parent FromGroup ValueChangeEvent and StatusChangeEvent if options object with onlySelf parameter set to true was passed into the parameters', () => {
      const onChange = vi.fn()
      const onStatus = vi.fn()

      expect(form.valid).toBeFalsy()
      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof ValueChangeEvent) {
          onChange()
        }

        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      control.removeValidators([validator], { onlySelf: true })

      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)
      expect(form.valid).toBeFalsy()
    })
  })

  describe('setValidators()', () => {
    const value = {
      name: 'halib',
      surname: 'Kashmiri',
      age: 22,
    }

    const validators = [requiredValidator('test')]

    let form: FormGroup<{
      name: FormControl<string>
      surname?: FormControl<string>
      age: FormControl<number>
    }>

    let control: FormControl<string>

    beforeEach(() => {
      control = new FormControl<string>(value.name, [capitalizeValidator('test')])

      form = new FormGroup<{
        name: FormControl<string>
        surname?: FormControl<string>
        age: FormControl<number>
      }>({ name: control, surname: new FormControl(value.surname), age: new FormControl(value.age) })
    })

    it('Should update the parent FormGroup status if no options object was passed into the parameters', () => {
      expect(form.valid).toBeFalsy()

      control.setValidators(validators)

      expect(form.valid).toBeTruthy()
    })

    it('Should not update the parent FormGroup status if options object with onlySelf parameter set to true was passed into the parameters', () => {
      expect(form.valid).toBeFalsy()

      control.setValidators(validators, { onlySelf: true })

      expect(form.valid).toBeFalsy()
    })

    it('Should call parent FromGroup ValueChangeEvent and StatusChangeEvent if no options object was passed into the parameters', () => {
      const onChange = vi.fn()
      const onStatus = vi.fn()

      expect(form.valid).toBeFalsy()
      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof ValueChangeEvent) {
          onChange()
        }

        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      control.setValidators(validators)

      expect(onChange).toBeCalledTimes(1)
      expect(onStatus).toBeCalledTimes(1)
      expect(form.valid).toBeTruthy()
    })

    it('Should not call parent FromGroup ValueChangeEvent and StatusChangeEvent if options object with onlySelf parameter set to true was passed into the parameters', () => {
      const onChange = vi.fn()
      const onStatus = vi.fn()

      expect(form.valid).toBeFalsy()
      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof ValueChangeEvent) {
          onChange()
        }

        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      control.setValidators(validators, { onlySelf: true })

      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)
      expect(form.valid).toBeFalsy()
    })
  })

  describe('clearValidators()', () => {
    const value = {
      name: 'halib',
      surname: 'Kashmiri',
      age: 22,
    }

    let form: FormGroup<{
      name: FormControl<string>
      surname?: FormControl<string>
      age: FormControl<number>
    }>

    let control: FormControl<string>

    beforeEach(() => {
      control = new FormControl<string>(value.name, [capitalizeValidator('test')])

      form = new FormGroup<{
        name: FormControl<string>
        surname?: FormControl<string>
        age: FormControl<number>
      }>({ name: control, surname: new FormControl(value.surname), age: new FormControl(value.age) })
    })

    it('Should update the parent FormGroup status if no options object was passed into the parameters', () => {
      expect(form.valid).toBeFalsy()

      control.clearValidators()

      expect(form.valid).toBeTruthy()
    })

    it('Should not update the parent FormGroup status if options object with onlySelf parameter set to true was passed into the parameters', () => {
      expect(form.valid).toBeFalsy()

      control.clearValidators({ onlySelf: true })

      expect(form.valid).toBeFalsy()
    })

    it('Should call parent FromGroup ValueChangeEvent and StatusChangeEvent if no options object was passed into the parameters', () => {
      const onChange = vi.fn()
      const onStatus = vi.fn()

      expect(form.valid).toBeFalsy()
      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof ValueChangeEvent) {
          onChange()
        }

        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      control.clearValidators()

      expect(onChange).toBeCalledTimes(1)
      expect(onStatus).toBeCalledTimes(1)
      expect(form.valid).toBeTruthy()
    })

    it('Should not call parent FromGroup ValueChangeEvent and StatusChangeEvent if options object with onlySelf parameter set to true was passed into the parameters', () => {
      const onChange = vi.fn()
      const onStatus = vi.fn()

      expect(form.valid).toBeFalsy()
      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof ValueChangeEvent) {
          onChange()
        }

        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      control.clearValidators({ onlySelf: true })

      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)
      expect(form.valid).toBeFalsy()
    })
  })

  describe('markAsTouched()', () => {
    let form: FormGroup<{
      name: FormControl<string>
      surname?: FormControl<string>
      age: FormControl<number>
    }>

    let control: FormControl<string>

    beforeEach(() => {
      control = new FormControl<string>('test')

      form = new FormGroup<{
        name: FormControl<string>
        surname?: FormControl<string>
        age: FormControl<number>
      }>({ name: control, surname: new FormControl('test'), age: new FormControl(22) })
    })

    it('Should set the parent FormGroup _touched property to true if no options object was passed into the parameters', () => {
      expect(control.touched).toBeFalsy()
      expect(form.touched).toBeFalsy()

      control.markAsTouched()

      expect(control.touched).toBeTruthy()
      expect(form.touched).toBeTruthy()
    })

    it('Should not set the parent FormGroup _touched property to true if options object with onlySelf parameter set to true was passed into the parameters', () => {
      expect(control.touched).toBeFalsy()
      expect(form.touched).toBeFalsy()

      control.markAsTouched({ onlySelf: true })

      expect(control.touched).toBeTruthy()
      expect(form.touched).toBeFalsy()
    })

    it('Should call the parent FromGroup TouchedChangeEvent if no options object was passed into the parameters', () => {
      const onTouch = vi.fn()

      expect(form.touched).toBeFalsy()
      expect(control.touched).toBeFalsy()
      expect(onTouch).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof TouchedChangeEvent) {
          onTouch()
        }
      })
      control.markAsTouched()

      expect(onTouch).toBeCalledTimes(1)
      expect(control.touched).toBeTruthy()
      expect(form.touched).toBeTruthy()
    })

    it('Should not call the parent FromGroup TouchedChangeEvent if options object with onlySelf parameter set to true was passed into the parameters', () => {
      const onTouch = vi.fn()

      expect(form.touched).toBeFalsy()
      expect(control.touched).toBeFalsy()
      expect(onTouch).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof TouchedChangeEvent) {
          onTouch()
        }
      })
      control.markAsTouched({ onlySelf: true })

      expect(onTouch).toBeCalledTimes(0)
      expect(control.touched).toBeTruthy()
      expect(form.touched).toBeFalsy()
    })
  })

  describe('markAsUntouched()', () => {
    let form: FormGroup<{
      name: FormControl<string>
      surname?: FormControl<string>
      age: FormControl<number>
    }>

    let control: FormControl<string>

    beforeEach(() => {
      control = new FormControl<string>('test')

      form = new FormGroup<{
        name: FormControl<string>
        surname?: FormControl<string>
        age: FormControl<number>
      }>({ name: control, surname: new FormControl('test'), age: new FormControl(22) })

      control.markAsTouched()
    })

    it('Should set the parent FormGroup _touched property to false if no options object was passed into the parameters', () => {
      expect(control.touched).toBeTruthy()
      expect(form.touched).toBeTruthy()

      control.markAsUntouched()

      expect(control.touched).toBeFalsy()
      expect(form.touched).toBeFalsy()
    })

    it('Should not set the parent FormGroup _touched property to true if options object with onlySelf parameter set to true was passed into the parameters', () => {
      expect(control.touched).toBeTruthy()
      expect(form.touched).toBeTruthy()

      control.markAsUntouched({ onlySelf: true })

      expect(control.touched).toBeFalsy()
      expect(form.touched).toBeTruthy()
    })

    it('Should call the parent FromGroup TouchedChangeEvent if no options object was passed into the parameters', () => {
      const onTouch = vi.fn()

      expect(control.touched).toBeTruthy()
      expect(form.touched).toBeTruthy()
      expect(onTouch).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof TouchedChangeEvent) {
          onTouch()
        }
      })
      control.markAsUntouched()

      expect(onTouch).toBeCalledTimes(1)
      expect(control.touched).toBeFalsy()
      expect(form.touched).toBeFalsy()
    })

    it('Should not call the parent FromGroup TouchedChangeEvent if options object with onlySelf parameter set to true was passed into the parameters', () => {
      const onTouch = vi.fn()

      expect(control.touched).toBeTruthy()
      expect(form.touched).toBeTruthy()
      expect(onTouch).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof TouchedChangeEvent) {
          onTouch()
        }
      })
      control.markAsUntouched({ onlySelf: true })

      expect(onTouch).toBeCalledTimes(0)
      expect(control.touched).toBeFalsy()
      expect(form.touched).toBeTruthy()
    })
  })

  describe('markAsDirty()', () => {
    let form: FormGroup<{
      name: FormControl<string>
      surname?: FormControl<string>
      age: FormControl<number>
    }>

    let control: FormControl<string>

    beforeEach(() => {
      control = new FormControl<string>('test')

      form = new FormGroup<{
        name: FormControl<string>
        surname?: FormControl<string>
        age: FormControl<number>
      }>({ name: control, surname: new FormControl('test'), age: new FormControl(22) })
    })

    it('Should set the parent FormGroup _dirty property to true if no options object was passed into the parameters', () => {
      expect(control.dirty).toBeFalsy()
      expect(form.dirty).toBeFalsy()

      control.markAsDirty()

      expect(control.dirty).toBeTruthy()
      expect(form.dirty).toBeTruthy()
    })

    it('Should not set the parent FormGroup _dirty property to true if options object with onlySelf parameter set to true was passed into the parameters', () => {
      expect(control.dirty).toBeFalsy()
      expect(form.dirty).toBeFalsy()

      control.markAsDirty({ onlySelf: true })

      expect(control.dirty).toBeTruthy()
      expect(form.dirty).toBeFalsy()
    })

    it('Should call the parent FromGroup PristineChangeEvent if no options object was passed into the parameters', () => {
      const onPristine = vi.fn()

      expect(form.dirty).toBeFalsy()
      expect(control.dirty).toBeFalsy()
      expect(onPristine).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof PristineChangeEvent) {
          onPristine()
        }
      })
      control.markAsDirty()

      expect(onPristine).toBeCalledTimes(1)
      expect(control.dirty).toBeTruthy()
      expect(form.dirty).toBeTruthy()
    })

    it('Should not call the parent FromGroup PristineChangeEvent if options object with onlySelf parameter set to true was passed into the parameters', () => {
      const onTouch = vi.fn()

      expect(form.dirty).toBeFalsy()
      expect(control.dirty).toBeFalsy()
      expect(onTouch).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof TouchedChangeEvent) {
          onTouch()
        }
      })
      control.markAsDirty({ onlySelf: true })

      expect(onTouch).toBeCalledTimes(0)
      expect(control.dirty).toBeTruthy()
      expect(form.dirty).toBeFalsy()
    })
  })

  describe('markAsPristine()', () => {
    let form: FormGroup<{
      name: FormControl<string>
      surname?: FormControl<string>
      age: FormControl<number>
    }>

    let control: FormControl<string>

    beforeEach(() => {
      control = new FormControl<string>('test')

      form = new FormGroup<{
        name: FormControl<string>
        surname?: FormControl<string>
        age: FormControl<number>
      }>({ name: control, surname: new FormControl('test'), age: new FormControl(22) })

      control.markAsDirty()
    })

    it('Should set the parent FormGroup _dirty property to true if no options object was passed into the parameters', () => {
      expect(control.dirty).toBeTruthy()
      expect(form.dirty).toBeTruthy()

      control.markAsPristine()

      expect(control.dirty).toBeFalsy()
      expect(form.dirty).toBeFalsy()
    })

    it('Should not set the parent FormGroup _dirty property to true if options object with onlySelf parameter set to true was passed into the parameters', () => {
      expect(control.dirty).toBeTruthy()
      expect(form.dirty).toBeTruthy()

      control.markAsPristine({ onlySelf: true })

      expect(control.dirty).toBeFalsy()
      expect(form.dirty).toBeTruthy()
    })

    it('Should call the parent FromGroup PristineChangeEvent if no options object was passed into the parameters', () => {
      const onPristine = vi.fn()

      expect(control.dirty).toBeTruthy()
      expect(form.dirty).toBeTruthy()
      expect(onPristine).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof PristineChangeEvent) {
          onPristine()
        }
      })
      control.markAsPristine()

      expect(onPristine).toBeCalledTimes(1)
      expect(control.dirty).toBeFalsy()
      expect(form.dirty).toBeFalsy()
    })

    it('Should not call the parent FromGroup PristineChangeEvent if options object with onlySelf parameter set to true was passed into the parameters', () => {
      const onPristine = vi.fn()

      expect(control.dirty).toBeTruthy()
      expect(form.dirty).toBeTruthy()
      expect(onPristine).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof PristineChangeEvent) {
          onPristine()
        }
      })
      control.markAsPristine({ onlySelf: true })

      expect(onPristine).toBeCalledTimes(0)
      expect(control.dirty).toBeFalsy()
      expect(form.dirty).toBeTruthy()
    })
  })
})

describe('FormGroup', () => {
  describe('setValue()', () => {
    const oldValue = {
      name: 'Halib',
      age: 22,
    }

    const newValue = {
      name: 'test',
      age: 22,
    }

    let nameControl: FormControl<string>
    let ageControl: FormControl<number>

    let form: FormGroup<{
      name: FormControl<string>
      age?: FormControl<number>
    }>

    beforeEach(() => {
      nameControl = new FormControl(oldValue.name, [capitalizeValidator('test')])
      ageControl = new FormControl(oldValue.age)

      form = new FormGroup<{
        name: FormControl<string>
        age?: FormControl<number>
      }>({
        name: nameControl,
        age: ageControl,
      })
    })

    it('Should update value of child controls', () => {
      expect(form.value).toStrictEqual(oldValue)
      expect(nameControl.value).toBe(oldValue.name)
      expect(ageControl.value).toBe(oldValue.age)

      form.setValue(newValue)

      expect(form.value).toStrictEqual(newValue)
      expect(nameControl.value).toBe(newValue.name)
      expect(ageControl.value).toBe(newValue.age)
    })

    it('Should call FromGroup ValueChangeEvent and StatusChangeEvent only once', () => {
      const onChange = vi.fn()
      const onStatus = vi.fn()

      expect(form.value).toStrictEqual(oldValue)
      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof ValueChangeEvent) {
          onChange()
        }

        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      form.setValue(newValue)

      expect(form.value).toStrictEqual(newValue)
      expect(onChange).toBeCalledTimes(1)
      expect(onStatus).toBeCalledTimes(1)
    })

    it('Should call child controls ValueChangeEvent and StatusChangeEvent if no options object was passed into the parameters', () => {
      const onChange = vi.fn()
      const onStatus = vi.fn()

      expect(form.value).toStrictEqual(oldValue)
      expect(nameControl.value).toBe(oldValue.name)
      expect(ageControl.value).toBe(oldValue.age)

      nameControl.events.subscribe((event) => {
        if (event instanceof ValueChangeEvent) {
          onChange()
        }

        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      form.setValue(newValue)

      expect(onChange).toBeCalledTimes(1)
      expect(onStatus).toBeCalledTimes(1)
      expect(form.value).toStrictEqual(newValue)
      expect(nameControl.value).toBe(newValue.name)
      expect(ageControl.value).toBe(newValue.age)
    })

    it('Should not call child controls ValueChangeEvent and StatusChangeEvent if options object with parameter emitEvent set to false was passed into the parameters', () => {
      const onChange = vi.fn()
      const onStatus = vi.fn()

      expect(form.value).toStrictEqual(oldValue)
      expect(nameControl.value).toBe(oldValue.name)
      expect(ageControl.value).toBe(oldValue.age)

      nameControl.events.subscribe((event) => {
        if (event instanceof ValueChangeEvent) {
          onChange()
        }

        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      form.setValue(newValue, { emitEvent: false })

      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)
      expect(form.value).toStrictEqual(newValue)
      expect(nameControl.value).toBe(newValue.name)
      expect(ageControl.value).toBe(newValue.age)
    })
  })

  describe('reset()', () => {
    const initialValue = {
      name: 'Halib',
      age: 22,
    }

    const mutatedValue = {
      name: 'test',
      age: 22,
    }

    let nameControl: FormControl<string>
    let ageControl: FormControl<number>

    let form: FormGroup<{
      name: FormControl<string>
      age?: FormControl<number>
    }>

    beforeEach(() => {
      nameControl = new FormControl(initialValue.name, [capitalizeValidator('test')])
      ageControl = new FormControl(initialValue.age)

      form = new FormGroup<{
        name: FormControl<string>
        age?: FormControl<number>
      }>({
        name: nameControl,
        age: ageControl,
      })

      form.setValue(mutatedValue)
    })

    it('Should update value of child controls', () => {
      expect(form.value).toStrictEqual(mutatedValue)
      expect(nameControl.value).toBe(mutatedValue.name)
      expect(ageControl.value).toBe(mutatedValue.age)

      form.reset()

      expect(form.value).toStrictEqual(initialValue)
      expect(nameControl.value).toBe(initialValue.name)
      expect(ageControl.value).toBe(initialValue.age)
    })

    it('Should call ValueChangeEvent and StatusChangeEvent only once', () => {
      const onChange = vi.fn()
      const onStatus = vi.fn()

      expect(form.value).toStrictEqual(mutatedValue)
      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof ValueChangeEvent) {
          onChange()
        }

        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      form.reset()

      expect(form.value).toStrictEqual(initialValue)
      expect(onChange).toBeCalledTimes(1)
      expect(onStatus).toBeCalledTimes(1)
    })

    it('Should call child controls ValueChangeEvent and StatusChangeEvent if no options object was passed into the parameters', () => {
      const onChange = vi.fn()
      const onStatus = vi.fn()

      expect(form.value).toStrictEqual(mutatedValue)
      expect(nameControl.value).toBe(mutatedValue.name)
      expect(ageControl.value).toBe(mutatedValue.age)

      nameControl.events.subscribe((event) => {
        if (event instanceof ValueChangeEvent) {
          onChange()
        }

        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      form.reset()

      expect(onChange).toBeCalledTimes(1)
      expect(onStatus).toBeCalledTimes(1)
      expect(form.value).toStrictEqual(initialValue)
      expect(nameControl.value).toBe(initialValue.name)
      expect(ageControl.value).toBe(initialValue.age)
    })

    it('Should not call child controls ValueChangeEvent and StatusChangeEvent if options object with parameter emitEvent set to false was passed into the parameters', () => {
      const onChange = vi.fn()
      const onStatus = vi.fn()

      expect(form.value).toStrictEqual(mutatedValue)
      expect(nameControl.value).toBe(mutatedValue.name)
      expect(ageControl.value).toBe(mutatedValue.age)

      nameControl.events.subscribe((event) => {
        if (event instanceof ValueChangeEvent) {
          onChange()
        }

        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      form.reset({ emitEvent: false })

      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)
      expect(form.value).toStrictEqual(initialValue)
      expect(nameControl.value).toBe(initialValue.name)
      expect(ageControl.value).toBe(initialValue.age)
    })
  })

  describe('disable()', () => {
    let nameControl: FormControl<string>
    let ageControl: FormControl<number>

    let form: FormGroup<{
      name: FormControl<string>
      age?: FormControl<number>
    }>

    beforeEach(() => {
      nameControl = new FormControl<string>('Halib', [capitalizeValidator('test')])
      ageControl = new FormControl(22)

      form = new FormGroup<{
        name: FormControl<string>
        age?: FormControl<number>
      }>({
        name: nameControl,
        age: ageControl,
      })
    })

    it('Should disable child controls', () => {
      expect(form.disabled).toBeFalsy()
      expect(nameControl.disabled).toBeFalsy()
      expect(ageControl.disabled).toBeFalsy()

      form.disable()

      expect(form.disabled).toBeTruthy()
      expect(nameControl.disabled).toBeTruthy()
      expect(ageControl.disabled).toBeTruthy()
    })

    it('Should call child controls DisabledChangeEvent if no options object was passed into the parameters', () => {
      const onDisable = vi.fn()

      expect(form.disabled).toBeFalsy()
      expect(nameControl.disabled).toBeFalsy()
      expect(ageControl.disabled).toBeFalsy()

      nameControl.events.subscribe((event) => {
        if (event instanceof DisabledChangeEvent) {
          onDisable()
        }
      })
      form.disable()

      expect(onDisable).toBeCalledTimes(1)
      expect(form.disabled).toBeTruthy()
      expect(nameControl.disabled).toBeTruthy()
      expect(ageControl.disabled).toBeTruthy()
    })

    it('Should not call child controls DisabledChangeEvent if options object with parameter emitEvent set to false was passed into the parameters', () => {
      const onDisable = vi.fn()

      expect(form.disabled).toBeFalsy()
      expect(nameControl.disabled).toBeFalsy()
      expect(ageControl.disabled).toBeFalsy()

      nameControl.events.subscribe((event) => {
        if (event instanceof DisabledChangeEvent) {
          onDisable()
        }
      })
      form.disable({ emitEvent: false })

      expect(onDisable).toBeCalledTimes(0)
      expect(form.disabled).toBeTruthy()
      expect(nameControl.disabled).toBeTruthy()
      expect(ageControl.disabled).toBeTruthy()
    })
  })

  describe('enable()', () => {
    let nameControl: FormControl<string>
    let ageControl: FormControl<number>

    let form: FormGroup<{
      name: FormControl<string>
      age?: FormControl<number>
    }>

    beforeEach(() => {
      nameControl = new FormControl<string>('Halib', [capitalizeValidator('test')])
      ageControl = new FormControl(22)

      form = new FormGroup<{
        name: FormControl<string>
        age?: FormControl<number>
      }>({
        name: nameControl,
        age: ageControl,
      })

      form.disable()
    })

    it('Should enable child controls', () => {
      expect(form.disabled).toBeTruthy()
      expect(nameControl.disabled).toBeTruthy()
      expect(ageControl.disabled).toBeTruthy()

      form.enable()

      expect(form.disabled).toBeFalsy()
      expect(nameControl.disabled).toBeFalsy()
      expect(ageControl.disabled).toBeFalsy()
    })

    it('Should call child controls DisabledChangeEvent if no options object was passed into the parameters', () => {
      const onDisable = vi.fn()

      expect(form.disabled).toBeTruthy()
      expect(nameControl.disabled).toBeTruthy()
      expect(ageControl.disabled).toBeTruthy()

      nameControl.events.subscribe((event) => {
        if (event instanceof DisabledChangeEvent) {
          onDisable()
        }
      })
      form.enable()

      expect(onDisable).toBeCalledTimes(1)
      expect(form.disabled).toBeFalsy()
      expect(nameControl.disabled).toBeFalsy()
      expect(ageControl.disabled).toBeFalsy()
    })

    it('Should not call child controls DisabledChangeEvent if options object with parameter emitEvent set to false was passed into the parameters', () => {
      const onDisable = vi.fn()

      expect(form.disabled).toBeTruthy()
      expect(nameControl.disabled).toBeTruthy()
      expect(ageControl.disabled).toBeTruthy()

      nameControl.events.subscribe((event) => {
        if (event instanceof DisabledChangeEvent) {
          onDisable()
        }
      })
      form.enable({ emitEvent: false })

      expect(onDisable).toBeCalledTimes(0)
      expect(form.disabled).toBeFalsy()
      expect(nameControl.disabled).toBeFalsy()
      expect(ageControl.disabled).toBeFalsy()
    })
  })

  describe('markAsTouched()', () => {
    let nameControl: FormControl<string>
    let ageControl: FormControl<number>

    let form: FormGroup<{
      name: FormControl<string>
      age?: FormControl<number>
    }>

    beforeEach(() => {
      nameControl = new FormControl<string>('Halib', [capitalizeValidator('test')])
      ageControl = new FormControl(22)

      form = new FormGroup<{
        name: FormControl<string>
        age?: FormControl<number>
      }>({
        name: nameControl,
        age: ageControl,
      })
    })

    it('Should set child controls _touched property to true', () => {
      expect(form.touched).toBeFalsy()
      expect(nameControl.touched).toBeFalsy()
      expect(ageControl.touched).toBeFalsy()

      form.markAsTouched()

      expect(form.touched).toBeTruthy()
      expect(nameControl.touched).toBeTruthy()
      expect(ageControl.touched).toBeTruthy()
    })

    it('Should call FromGroup TouchedChangeEvent only once', () => {
      const onTouch = vi.fn()

      expect(form.touched).toBeFalsy()
      expect(nameControl.touched).toBeFalsy()
      expect(ageControl.touched).toBeFalsy()
      expect(onTouch).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof TouchedChangeEvent) {
          onTouch()
        }
      })
      form.markAsTouched()

      expect(onTouch).toBeCalledTimes(1)
      expect(form.touched).toBeTruthy()
      expect(nameControl.touched).toBeTruthy()
      expect(ageControl.touched).toBeTruthy()
    })

    it('Should call child controls TouchedChangeEvent if no options object was passed into the parameters', () => {
      const onTouch = vi.fn()

      expect(form.touched).toBeFalsy()
      expect(nameControl.touched).toBeFalsy()
      expect(ageControl.touched).toBeFalsy()
      expect(onTouch).toBeCalledTimes(0)

      nameControl.events.subscribe((event) => {
        if (event instanceof TouchedChangeEvent) {
          onTouch()
        }
      })
      form.markAsTouched()

      expect(onTouch).toBeCalledTimes(1)
      expect(form.touched).toBeTruthy()
      expect(nameControl.touched).toBeTruthy()
      expect(ageControl.touched).toBeTruthy()
    })

    it('Should not call child controls TouchedChangeEvent if options object with parameter emitEvent set to false was passed into the parameters', () => {
      const onTouch = vi.fn()

      expect(form.touched).toBeFalsy()
      expect(nameControl.touched).toBeFalsy()
      expect(ageControl.touched).toBeFalsy()
      expect(onTouch).toBeCalledTimes(0)

      nameControl.events.subscribe((event) => {
        if (event instanceof TouchedChangeEvent) {
          onTouch()
        }
      })
      form.markAsTouched({ emitEvent: false })

      expect(onTouch).toBeCalledTimes(0)
      expect(form.touched).toBeTruthy()
      expect(nameControl.touched).toBeTruthy()
      expect(ageControl.touched).toBeTruthy()
    })
  })

  describe('markAsUntouched()', () => {
    let nameControl: FormControl<string>
    let ageControl: FormControl<number>

    let form: FormGroup<{
      name: FormControl<string>
      age?: FormControl<number>
    }>

    beforeEach(() => {
      nameControl = new FormControl<string>('Halib', [capitalizeValidator('test')])
      ageControl = new FormControl(22)

      form = new FormGroup<{
        name: FormControl<string>
        age?: FormControl<number>
      }>({
        name: nameControl,
        age: ageControl,
      })

      form.markAsTouched()
    })

    it('Should set child controls _touched property to false', () => {
      expect(form.touched).toBeTruthy()
      expect(nameControl.touched).toBeTruthy()
      expect(ageControl.touched).toBeTruthy()

      form.markAsUntouched()

      expect(form.touched).toBeFalsy()
      expect(nameControl.touched).toBeFalsy()
      expect(ageControl.touched).toBeFalsy()
    })

    it('Should call FromGroup TouchedChangeEvent only once', () => {
      const onTouch = vi.fn()

      expect(form.touched).toBeTruthy()
      expect(nameControl.touched).toBeTruthy()
      expect(ageControl.touched).toBeTruthy()
      expect(onTouch).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof TouchedChangeEvent) {
          onTouch()
        }
      })
      form.markAsUntouched()

      expect(onTouch).toBeCalledTimes(1)
      expect(form.touched).toBeFalsy()
      expect(nameControl.touched).toBeFalsy()
      expect(ageControl.touched).toBeFalsy()
    })

    it('Should call child controls TouchedChangeEvent if no options object was passed into the parameters', () => {
      const onTouch = vi.fn()

      expect(form.touched).toBeTruthy()
      expect(nameControl.touched).toBeTruthy()
      expect(ageControl.touched).toBeTruthy()
      expect(onTouch).toBeCalledTimes(0)

      nameControl.events.subscribe((event) => {
        if (event instanceof TouchedChangeEvent) {
          onTouch()
        }
      })
      form.markAsUntouched()

      expect(onTouch).toBeCalledTimes(1)
      expect(form.touched).toBeFalsy()
      expect(nameControl.touched).toBeFalsy()
      expect(ageControl.touched).toBeFalsy()
    })

    it('Should not call child controls TouchedChangeEvent if options object with parameter emitEvent set to false was passed into the parameters', () => {
      const onTouch = vi.fn()

      expect(form.touched).toBeTruthy()
      expect(nameControl.touched).toBeTruthy()
      expect(ageControl.touched).toBeTruthy()
      expect(onTouch).toBeCalledTimes(0)

      nameControl.events.subscribe((event) => {
        if (event instanceof TouchedChangeEvent) {
          onTouch()
        }
      })
      form.markAsUntouched({ emitEvent: false })

      expect(onTouch).toBeCalledTimes(0)
      expect(form.touched).toBeFalsy()
      expect(nameControl.touched).toBeFalsy()
      expect(ageControl.touched).toBeFalsy()
    })
  })

  describe('markAsDirty()', () => {
    let nameControl: FormControl<string>
    let ageControl: FormControl<number>

    let form: FormGroup<{
      name: FormControl<string>
      age?: FormControl<number>
    }>

    beforeEach(() => {
      nameControl = new FormControl<string>('Halib', [capitalizeValidator('test')])
      ageControl = new FormControl(22)

      form = new FormGroup<{
        name: FormControl<string>
        age?: FormControl<number>
      }>({
        name: nameControl,
        age: ageControl,
      })
    })

    it('Should set child controls _dirty property to true', () => {
      expect(form.dirty).toBeFalsy()
      expect(nameControl.dirty).toBeFalsy()
      expect(ageControl.dirty).toBeFalsy()

      form.markAsDirty()

      expect(form.dirty).toBeTruthy()
      expect(nameControl.dirty).toBeTruthy()
      expect(ageControl.dirty).toBeTruthy()
    })

    it('Should call FromGroup PristineChangeEvent only once', () => {
      const onPristine = vi.fn()

      expect(form.dirty).toBeFalsy()
      expect(nameControl.dirty).toBeFalsy()
      expect(ageControl.dirty).toBeFalsy()
      expect(onPristine).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof PristineChangeEvent) {
          onPristine()
        }
      })
      form.markAsDirty()

      expect(onPristine).toBeCalledTimes(1)
      expect(form.dirty).toBeTruthy()
      expect(nameControl.dirty).toBeTruthy()
      expect(ageControl.dirty).toBeTruthy()
    })

    it('Should call child controls PristineChangeEvent if no options object was passed into the parameters', () => {
      const onPristine = vi.fn()

      expect(form.dirty).toBeFalsy()
      expect(nameControl.dirty).toBeFalsy()
      expect(ageControl.dirty).toBeFalsy()
      expect(onPristine).toBeCalledTimes(0)

      nameControl.events.subscribe((event) => {
        if (event instanceof PristineChangeEvent) {
          onPristine()
        }
      })
      form.markAsDirty()

      expect(onPristine).toBeCalledTimes(1)
      expect(form.dirty).toBeTruthy()
      expect(nameControl.dirty).toBeTruthy()
      expect(ageControl.dirty).toBeTruthy()
    })

    it('Should not call child controls PristineChangeEvent if options object with parameter emitEvent set to false was passed into the parameters', () => {
      const onPristine = vi.fn()

      expect(form.dirty).toBeFalsy()
      expect(nameControl.dirty).toBeFalsy()
      expect(ageControl.dirty).toBeFalsy()
      expect(onPristine).toBeCalledTimes(0)

      nameControl.events.subscribe((event) => {
        if (event instanceof PristineChangeEvent) {
          onPristine()
        }
      })
      form.markAsDirty({ emitEvent: false })

      expect(onPristine).toBeCalledTimes(0)
      expect(form.dirty).toBeTruthy()
      expect(nameControl.dirty).toBeTruthy()
      expect(ageControl.dirty).toBeTruthy()
    })
  })

  describe('markAsPristine()', () => {
    let nameControl: FormControl<string>
    let ageControl: FormControl<number>

    let form: FormGroup<{
      name: FormControl<string>
      age?: FormControl<number>
    }>

    beforeEach(() => {
      nameControl = new FormControl<string>('Halib', [capitalizeValidator('test')])
      ageControl = new FormControl(22)

      form = new FormGroup<{
        name: FormControl<string>
        age?: FormControl<number>
      }>({
        name: nameControl,
        age: ageControl,
      })

      form.markAsDirty()
    })

    it('Should set child controls _dirty property to false', () => {
      expect(form.dirty).toBeTruthy()
      expect(nameControl.dirty).toBeTruthy()
      expect(ageControl.dirty).toBeTruthy()

      form.markAsPristine()

      expect(form.dirty).toBeFalsy()
      expect(nameControl.dirty).toBeFalsy()
      expect(ageControl.dirty).toBeFalsy()
    })

    it('Should call FromGroup PristineChangeEvent only once', () => {
      const onPristine = vi.fn()

      expect(form.dirty).toBeTruthy()
      expect(nameControl.dirty).toBeTruthy()
      expect(ageControl.dirty).toBeTruthy()
      expect(onPristine).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof PristineChangeEvent) {
          onPristine()
        }
      })
      form.markAsPristine()

      expect(onPristine).toBeCalledTimes(1)
      expect(form.dirty).toBeFalsy()
      expect(nameControl.dirty).toBeFalsy()
      expect(ageControl.dirty).toBeFalsy()
    })

    it('Should call child controls PristineChangeEvent if no options object was passed into the parameters', () => {
      const onPristine = vi.fn()

      expect(form.dirty).toBeTruthy()
      expect(nameControl.dirty).toBeTruthy()
      expect(ageControl.dirty).toBeTruthy()
      expect(onPristine).toBeCalledTimes(0)

      nameControl.events.subscribe((event) => {
        if (event instanceof PristineChangeEvent) {
          onPristine()
        }
      })
      form.markAsPristine()

      expect(onPristine).toBeCalledTimes(1)
      expect(form.dirty).toBeFalsy()
      expect(nameControl.dirty).toBeFalsy()
      expect(ageControl.dirty).toBeFalsy()
    })

    it('Should not call child controls PristineChangeEvent if options object with parameter emitEvent set to false was passed into the parameters', () => {
      const onPristine = vi.fn()

      expect(form.dirty).toBeTruthy()
      expect(nameControl.dirty).toBeTruthy()
      expect(ageControl.dirty).toBeTruthy()
      expect(onPristine).toBeCalledTimes(0)

      nameControl.events.subscribe((event) => {
        if (event instanceof PristineChangeEvent) {
          onPristine()
        }
      })
      form.markAsPristine({ emitEvent: false })

      expect(onPristine).toBeCalledTimes(0)
      expect(form.dirty).toBeFalsy()
      expect(nameControl.dirty).toBeFalsy()
      expect(ageControl.dirty).toBeFalsy()
    })
  })
})
