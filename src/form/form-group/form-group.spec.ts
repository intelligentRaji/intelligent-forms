import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  PristineChangeEvent,
  StatusChangeEvent,
  TouchedChangeEvent,
  ValueChangeEvent,
} from '@/abstract/abstract-control/abstract-control'
import { fieldEqualityValidator } from '@/validators/field-equality.validator'
import { capitalizeValidator } from '@/validators/capitalize.validator'
import { FormGroup } from './form-group'
import { FormControl } from '../form-control/form-control'

describe('FormGroup', () => {
  describe('instantiation', () => {
    it('Should create an instance with single control', () => {
      const control = new FormControl('test')

      const form = new FormGroup({ name: control })

      expect(form.value).toStrictEqual({ name: 'test' })
      expect(form.controls).toStrictEqual({ name: control })
    })

    it('Should create an instance with multiple controls', () => {
      const control = new FormControl('test')
      const control2 = new FormControl(2)

      const form = new FormGroup({ name: control, age: control2 })

      expect(form.value).toStrictEqual({ name: 'test', age: 2 })
      expect(form.controls).toStrictEqual({ name: control, age: control2 })
    })

    it('Should create an instance with nested FormGroup', () => {
      const name = new FormControl('test')
      const email = new FormControl('mail')
      const age = new FormControl(22)
      const data = new FormGroup({ email, age })

      const form = new FormGroup({ name, data })

      expect(form.value).toStrictEqual({ name: 'test', data: { email: 'mail', age: 22 } })
      expect(form.controls).toStrictEqual({ name, data })
    })

    it('Should create an instance and set the status property to invalid if the initial value is invalid', () => {
      const form = new FormGroup({
        name: new FormControl('Halib'),
        surname: new FormControl('Kashmiri'),
        data: new FormGroup(
          {
            password: new FormControl('asd'),
            repeatPassword: new FormControl('qwe'),
          },
          [fieldEqualityValidator(['password', 'repeatPassword'], '')],
        ),
      })

      expect(form.invalid).toBeTruthy()
    })
  })

  describe('getters', () => {
    describe('controls()', () => {
      it('Should return controls object', () => {
        const control = new FormControl('test')
        const form = new FormGroup({ test: control })

        expect(form.controls).toStrictEqual({ test: control })
      })
    })
  })

  describe('setValue()', () => {
    let form: FormGroup<{
      name: FormControl<string>
      surname: FormControl<string>
      data: FormGroup<{
        password: FormControl<string>
        repeatPassword: FormControl<string>
      }>
    }>

    beforeEach(() => {
      form = new FormGroup({
        name: new FormControl('Halib'),
        surname: new FormControl('Kashmiri'),
        data: new FormGroup(
          {
            password: new FormControl('asd'),
            repeatPassword: new FormControl('qwe'),
          },
          [fieldEqualityValidator(['password', 'repeatPassword'], '')],
        ),
      })
    })

    it('Should set new value and invoke the ValueChangeEvent', () => {
      const onChange = vi.fn()

      expect(form.value).toStrictEqual({
        name: 'Halib',
        surname: 'Kashmiri',
        data: { password: 'asd', repeatPassword: 'qwe' },
      })

      form.events.subscribe((event) => {
        if (event instanceof ValueChangeEvent) {
          onChange()
        }
      })
      form.setValue({ name: 'Dimas' })

      expect(onChange).toBeCalledTimes(1)
      expect(form.value).toStrictEqual({
        name: 'Dimas',
        surname: 'Kashmiri',
        data: { password: 'asd', repeatPassword: 'qwe' },
      })
    })

    it('Should set new value and invoke the StatusChangeEvent', () => {
      const onStatus = vi.fn()

      expect(form.value).toStrictEqual({
        name: 'Halib',
        surname: 'Kashmiri',
        data: { password: 'asd', repeatPassword: 'qwe' },
      })
      expect(form.valid).toBeFalsy()

      form.events.subscribe((event) => {
        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      form.setValue({ data: { password: 'qwe' } })

      expect(form.valid).toBeTruthy()
      expect(onStatus).toBeCalledTimes(1)
      expect(form.value).toStrictEqual({
        name: 'Halib',
        surname: 'Kashmiri',
        data: { password: 'qwe', repeatPassword: 'qwe' },
      })
    })

    it('The ValueChangeEvent and StatusChangeEvent should be raised if no options object was passed to the parameters', () => {
      const onStatus = vi.fn()
      const onChange = vi.fn()

      expect(form.value).toStrictEqual({
        name: 'Halib',
        surname: 'Kashmiri',
        data: { password: 'asd', repeatPassword: 'qwe' },
      })
      expect(form.valid).toBeFalsy()

      form.events.subscribe((event) => {
        if (event instanceof StatusChangeEvent) {
          onStatus()
        }

        if (event instanceof ValueChangeEvent) {
          onChange()
        }
      })
      form.setValue({ data: { password: 'qwe' } })

      expect(form.valid).toBeTruthy()
      expect(onStatus).toBeCalledTimes(1)
      expect(onChange).toBeCalledTimes(1)
      expect(form.value).toStrictEqual({
        name: 'Halib',
        surname: 'Kashmiri',
        data: { password: 'qwe', repeatPassword: 'qwe' },
      })
    })

    it('ValueChangeEvent and StatusChangeEvent should not be called if an options object was passed to the parameters with an emitEvent parameter set to false', () => {
      const onStatus = vi.fn()
      const onChange = vi.fn()

      expect(form.value).toStrictEqual({
        name: 'Halib',
        surname: 'Kashmiri',
        data: { password: 'asd', repeatPassword: 'qwe' },
      })
      expect(form.valid).toBeFalsy()

      form.events.subscribe((event) => {
        if (event instanceof StatusChangeEvent) {
          onStatus()
        }

        if (event instanceof ValueChangeEvent) {
          onChange()
        }
      })
      form.setValue({ data: { password: 'qwe' } }, { emitEvent: false })

      expect(form.valid).toBeTruthy()
      expect(onStatus).toBeCalledTimes(0)
      expect(onChange).toBeCalledTimes(0)
      expect(form.value).toStrictEqual({
        name: 'Halib',
        surname: 'Kashmiri',
        data: { password: 'qwe', repeatPassword: 'qwe' },
      })
    })
  })

  describe('reset()', () => {
    const initialValue = {
      name: 'Halib',
      data: {
        age: 22,
        email: 'halib@qwe.com',
      },
    }

    let form: FormGroup<{
      name: FormControl<string>
      data: FormGroup<{ age: FormControl<number>; email: FormControl<string> }>
    }>

    beforeEach(() => {
      form = new FormGroup({
        name: new FormControl(initialValue.name, [capitalizeValidator('meesage')]),
        data: new FormGroup({
          age: new FormControl(initialValue.data.age),
          email: new FormControl(initialValue.data.email),
        }),
      })
    })

    it('Should reset the value', () => {
      const name = 'halib'

      expect(form.value).toStrictEqual(initialValue)

      form.setValue({ name })
      expect(form.value).toStrictEqual({ ...initialValue, name })

      form.reset()

      expect(form.value).toStrictEqual(initialValue)
    })

    it('The ValueChangeEvent and StatusChange events should be raised if no options object was passed to the parameters.', () => {
      const name = 'halib'
      const onChange = vi.fn()
      const onStatus = vi.fn()

      expect(form.value).toStrictEqual(initialValue)

      form.setValue({ name })
      expect(form.value).toStrictEqual({ ...initialValue, name })

      form.events.subscribe((event) => {
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
    })

    it('ValueChangeEvent and StatusChangeEvent should not be called if an options object was passed to the parameters with an emitEvent parameter set to false', () => {
      const name = 'halib'
      const onChange = vi.fn()
      const onStatus = vi.fn()

      expect(form.value).toStrictEqual(initialValue)

      form.setValue({ name })
      expect(form.value).toStrictEqual({ ...initialValue, name })

      form.events.subscribe((event) => {
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
    })
  })

  describe('contains()', () => {
    const controls = {
      name: new FormControl('Halib'),
    }

    let form: FormGroup<{
      name: FormControl<string>
      surname?: FormControl<string>
    }>

    beforeEach(() => {
      form = new FormGroup<{
        name: FormControl<string>
        surname?: FormControl<string>
      }>(controls)
    })

    it('Should return true if FormGroup has a child with given name', () => {
      const controlName = 'name'
      expect(form.controls).toStrictEqual(controls)

      expect(form.contains(controlName)).toBeTruthy()
    })

    it('Should return false if FormGroup has not a child with given name', () => {
      const controlName = 'surname'
      expect(form.controls).toStrictEqual(controls)

      expect(form.contains(controlName)).toBeFalsy()
    })

    it('Should return true if given control is a child of the FormGroup', () => {
      const control = controls.name
      expect(form.controls).toStrictEqual(controls)

      expect(form.contains(control)).toBeTruthy()
    })

    it('Should return false if given control is not a child of the FormGroup', () => {
      const control = new FormControl('test')
      expect(form.controls).toStrictEqual(controls)

      expect(form.contains(control)).toBeFalsy()
    })
  })

  describe('get()', () => {
    const control = new FormControl('Halib')

    let form: FormGroup<{
      name: FormControl<string>
      surname?: FormControl<string>
    }>

    beforeEach(() => {
      form = new FormGroup<{
        name: FormControl<string>
        surname?: FormControl<string>
      }>({
        name: control,
      })
    })

    it('Should return the control if FormGroup has a child with given name', () => {
      const controlName = 'name'
      expect(form.contains(controlName)).toBeTruthy()

      expect(form.get(controlName)).toBe(control)
    })

    it('Should return null if FormGroup has not a child with given name', () => {
      const controlName = 'surname'
      expect(form.contains(controlName)).toBeFalsy()

      expect(form.get(controlName)).toBeNull()
    })
  })

  describe('addControl()', () => {
    const value = {
      name: 'Halib',
      age: 22,
      surname: 'Kashmiri',
    }

    let form: FormGroup<{
      name: FormControl<string>
      surname?: FormControl<string>
      age: FormControl<number>
    }>

    beforeEach(() => {
      form = new FormGroup<{
        name: FormControl<string>
        surname?: FormControl<string>
        age: FormControl<number>
      }>({ name: new FormControl(value.name), age: new FormControl(value.age) })
    })

    it('Should add a control if a control with given name does not exists in the FormGroup', () => {
      const control = new FormControl('Kashmiri')
      const name = 'surname'
      expect(form.contains(control)).toBeFalsy()
      expect(form.contains(name)).toBeFalsy()

      form.addControl(name, control)

      expect(form.contains(name)).toBeTruthy()
      expect(form.contains(control)).toBeTruthy()
    })

    it('Should not add a control if a control with given name exists in the FormGroup', () => {
      const control = new FormControl('Kashmiri')
      const name = 'name'
      expect(form.contains(name)).toBeTruthy()
      expect(form.contains(control)).toBeFalsy()

      form.addControl(name, control)

      expect(form.contains(control)).toBeFalsy()
      expect(form.contains(name)).toBeTruthy()
    })

    it('Should update the value of the FormGroup if a control with given name was added successfuly', () => {
      const control = new FormControl(value.surname)
      const name = 'surname'
      const previousValue = { name: value.name, age: value.age }

      expect(form.contains(control)).toBeFalsy()
      expect(form.contains(name)).toBeFalsy()
      expect(form.value).toStrictEqual(previousValue)

      form.addControl(name, control)

      expect(form.value).toStrictEqual(value)
      expect(form.contains(name)).toBeTruthy()
      expect(form.contains(control)).toBeTruthy()
    })

    it('Should not update the value of the FormGroup if it alredy has a child with given name', () => {
      const control = new FormControl(21)
      const name = 'age'
      const previousValue = { name: value.name, age: value.age }

      expect(form.contains(control)).toBeFalsy()
      expect(form.contains(name)).toBeTruthy()
      expect(form.value).toStrictEqual(previousValue)

      form.addControl(name, control)

      expect(form.value).toStrictEqual(previousValue)
      expect(form.contains(name)).toBeTruthy()
      expect(form.contains(control)).toBeFalsy()
    })

    it('Should call ValueChangeEvent and StatusChangeEvent if options object was not passed into the parameters and control was added successfuly', () => {
      const onChange = vi.fn()
      const onStatus = vi.fn()
      const control = new FormControl<string>('kashmiri', [capitalizeValidator('test')])
      const name = 'surname'

      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)
      expect(form.contains(control)).toBeFalsy()
      expect(form.contains(name)).toBeFalsy()

      form.events.subscribe((event) => {
        if (event instanceof ValueChangeEvent) {
          onChange()
        }

        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      form.addControl(name, control)

      expect(onChange).toBeCalledTimes(1)
      expect(onStatus).toBeCalledTimes(1)
      expect(form.contains(name)).toBeTruthy()
      expect(form.contains(control)).toBeTruthy()
    })

    it('Should not call ValueChangeEvent and StatusChangeEvent if options object with emitEvent property set to false was passed into the parameters and control was added successfuly', () => {
      const onChange = vi.fn()
      const onStatus = vi.fn()
      const control = new FormControl<string>('kashmiri', [capitalizeValidator('test')])
      const name = 'surname'

      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)
      expect(form.contains(control)).toBeFalsy()
      expect(form.contains(name)).toBeFalsy()

      form.events.subscribe((event) => {
        if (event instanceof ValueChangeEvent) {
          onChange()
        }

        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      form.addControl(name, control, { emitEvent: false })

      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)
      expect(form.contains(name)).toBeTruthy()
      expect(form.contains(control)).toBeTruthy()
    })

    it('Should not call ValueChangeEvent and StatusChangeEvent if the options object was not passed into the parameters and the FormGroup alredy has a child with given name', () => {
      const onChange = vi.fn()
      const onStatus = vi.fn()
      const control = new FormControl<string>('kashmiri', [capitalizeValidator('test')])
      const name = 'name'

      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)
      expect(form.contains(control)).toBeFalsy()
      expect(form.contains(name)).toBeTruthy()

      form.events.subscribe((event) => {
        if (event instanceof ValueChangeEvent) {
          onChange()
        }

        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      form.addControl(name, control)

      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)
      expect(form.contains(name)).toBeTruthy()
      expect(form.contains(control)).toBeFalsy()
    })
  })

  describe('removeControl()', () => {
    const value = {
      name: 'Halib',
      surname: 'test',
      age: 22,
    }
    const control = new FormControl<string>(value.surname, [capitalizeValidator('test')])

    let form: FormGroup<{
      name: FormControl<string>
      surname?: FormControl<string>
      age: FormControl<number>
    }>

    beforeEach(() => {
      form = new FormGroup<{
        name: FormControl<string>
        surname?: FormControl<string>
        age: FormControl<number>
      }>({ name: new FormControl(value.name), surname: control, age: new FormControl(value.age) })
    })

    it('Should remove a control of the FormGroup', () => {
      const name = 'surname'

      expect(form.contains(control)).toBeTruthy()

      form.removeControl(name)

      expect(form.contains(control)).toBeFalsy()
    })

    it('Should update the value of the FormGroup if the control was removed', () => {
      const name = 'surname'
      const newValue = { name: value.name, age: value.age }

      expect(form.contains(name)).toBeTruthy()
      expect(form.value).toStrictEqual(value)

      form.removeControl(name)

      expect(form.contains(name)).toBeFalsy()
      expect(form.value).toStrictEqual(newValue)
    })

    it('Should call ValueChangeEvent and StatusChangeEvent if the control was removed from the FormGroup and options object was not passed into the parameters', () => {
      const name = 'surname'
      const onChange = vi.fn()
      const onStatus = vi.fn()

      expect(form.contains(control)).toBeTruthy()
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
      form.removeControl(name)

      expect(onChange).toBeCalledTimes(1)
      expect(onStatus).toBeCalledTimes(1)
      expect(form.contains(control)).toBeFalsy()
    })

    it('Should not call ValueChangeEvent and StatusChangeEvent if the control was removed from the FormGroup and options object with emitEvent parameter set to false was passed into the parameters', () => {
      const name = 'surname'
      const onChange = vi.fn()
      const onStatus = vi.fn()

      expect(form.contains(control)).toBeTruthy()
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
      form.removeControl(name, { emitEvent: false })

      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)
      expect(form.contains(control)).toBeFalsy()
    })
  })

  describe('replaceControl()', () => {
    const oldValue = {
      name: 'habib',
      surname: 'Kashmiri',
      age: 22,
    }

    const newValue = {
      name: 'halib',
      surname: 'Kashmiri',
      age: 22,
    }

    const oldControl = new FormControl(oldValue.name)
    const newControl = new FormControl(newValue.name, [capitalizeValidator('test')])

    let form: FormGroup<{
      name: FormControl<string>
      surname?: FormControl<string>
      age: FormControl<number>
    }>

    beforeEach(() => {
      form = new FormGroup<{
        name: FormControl<string>
        surname?: FormControl<string>
        age: FormControl<number>
      }>({ name: oldControl, surname: new FormControl(oldValue.surname), age: new FormControl(oldValue.age) })
    })

    it('Should replace a control with given name', () => {
      const name = 'name'

      expect(form.get(name)).toBe(oldControl)

      form.replaceControl(name, newControl)

      expect(form.get(name)).toBe(newControl)
    })

    it('Should update the value of the FormGroup if the control was replaced', () => {
      const name = 'name'

      expect(form.get(name)).toBe(oldControl)
      expect(form.value).toStrictEqual(oldValue)

      form.replaceControl(name, newControl)

      expect(form.get(name)).toBe(newControl)
      expect(form.value).toStrictEqual(newValue)
    })

    it('Should call ValueChangeEvent and StatusChangeEvent if the control was replaced and options object was not passed into the parameters', () => {
      const name = 'name'
      const onChange = vi.fn()
      const onStatus = vi.fn()

      expect(form.get(name)).toBe(oldControl)
      expect(onChange).toBeCalledTimes(0)
      expect(onChange).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof ValueChangeEvent) {
          onChange()
        }

        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      form.replaceControl(name, newControl)

      expect(form.get(name)).toBe(newControl)
      expect(onChange).toBeCalledTimes(1)
      expect(onChange).toBeCalledTimes(1)
    })

    it('Should not call ValueChangeEvent and StatusChangeEvent if the control was replaced and options object with emitEvent parameter set to false was passed into the parameters', () => {
      const name = 'name'
      const onChange = vi.fn()
      const onStatus = vi.fn()

      expect(form.get(name)).toBe(oldControl)
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
      form.replaceControl(name, newControl, { emitEvent: false })

      expect(form.get(name)).toBe(newControl)
      expect(onChange).toBeCalledTimes(0)
      expect(onStatus).toBeCalledTimes(0)
    })
  })

  describe('disable()', () => {
    it('Should disable the FormGroup', () => {
      const form = new FormGroup({ name: new FormControl('test') })

      expect(form.disabled).toBeFalsy()

      form.disable()

      expect(form.disabled).toBeTruthy()
    })
  })

  describe('enable()', () => {
    it('Should enable the FormGroup', () => {
      const form = new FormGroup({ name: new FormControl('test') })

      form.disable()
      expect(form.disabled).toBeTruthy()

      form.enable()

      expect(form.disabled).toBeFalsy()
    })
  })

  describe('markAsTouched()', () => {
    let form: FormGroup<{
      name: FormControl<string>
      age: FormControl<number>
    }>

    beforeEach(() => {
      form = new FormGroup<{
        name: FormControl<string>
        surname?: FormControl<string>
        age: FormControl<number>
      }>({ name: new FormControl('test'), age: new FormControl(22) })
    })

    it('Should make the FormGroup touched', () => {
      expect(form.touched).toBeFalsy()

      form.markAsTouched()

      expect(form.touched).toBeTruthy()
    })

    it('Should make the FormGroup touched and call TouchedChangeEvent if no options object was passed into the parameters', () => {
      const onTouch = vi.fn()

      expect(form.touched).toBeFalsy()
      expect(onTouch).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof TouchedChangeEvent) {
          onTouch()
        }
      })
      form.markAsTouched()

      expect(form.touched).toBeTruthy()
      expect(onTouch).toBeCalledTimes(1)
    })

    it('Should make the FormGroup touched and not call TouchedChangeEvent if options object with parameter emitEvent set to false was passed into the parameters', () => {
      const onTouch = vi.fn()

      expect(form.touched).toBeFalsy()
      expect(onTouch).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof TouchedChangeEvent) {
          onTouch()
        }
      })
      form.markAsTouched({ emitEvent: false })

      expect(form.touched).toBeTruthy()
      expect(onTouch).toBeCalledTimes(0)
    })

    it('Should not call TouchedChangeEvent if property _status was not changed', () => {
      const onTouch = vi.fn()

      form.markAsTouched()

      expect(form.touched).toBeTruthy()
      expect(onTouch).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof TouchedChangeEvent) {
          onTouch()
        }
      })
      form.markAsTouched()

      expect(form.touched).toBeTruthy()
      expect(onTouch).toBeCalledTimes(0)
    })
  })

  describe('markAsUntouched()', () => {
    let form: FormGroup<{
      name: FormControl<string>
      age: FormControl<number>
    }>

    beforeEach(() => {
      form = new FormGroup<{
        name: FormControl<string>
        surname?: FormControl<string>
        age: FormControl<number>
      }>({ name: new FormControl('test'), age: new FormControl(22) })
    })

    it('Should make the FormGroup untouched', () => {
      form.markAsTouched()

      expect(form.touched).toBeTruthy()

      form.markAsUntouched()

      expect(form.touched).toBeFalsy()
    })

    it('Should make the FormGroup untouched and call TouchedChangeEvent if no options object was passed into the parameters', () => {
      const onTouch = vi.fn()

      form.markAsTouched()

      expect(form.touched).toBeTruthy()
      expect(onTouch).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof TouchedChangeEvent) {
          onTouch()
        }
      })
      form.markAsUntouched()

      expect(form.touched).toBeFalsy()
      expect(onTouch).toBeCalledTimes(1)
    })

    it('Should make the FormGroup untouched and not call TouchedChangeEvent if options object with parameter emitEvent set to false was passed into the parameters', () => {
      const onTouch = vi.fn()

      form.markAsTouched()

      expect(form.touched).toBeTruthy()
      expect(onTouch).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof TouchedChangeEvent) {
          onTouch()
        }
      })
      form.markAsUntouched({ emitEvent: false })

      expect(form.touched).toBeFalsy()
      expect(onTouch).toBeCalledTimes(0)
    })

    it('Should not call TouchedChangeEvent if property _status was not changed', () => {
      const onTouch = vi.fn()

      expect(form.touched).toBeFalsy()
      expect(onTouch).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof TouchedChangeEvent) {
          onTouch()
        }
      })
      form.markAsUntouched()

      expect(form.touched).toBeFalsy()
      expect(onTouch).toBeCalledTimes(0)
    })
  })

  describe('markAsDirty()', () => {
    let form: FormGroup<{
      name: FormControl<string>
      age: FormControl<number>
    }>

    beforeEach(() => {
      form = new FormGroup<{
        name: FormControl<string>
        surname?: FormControl<string>
        age: FormControl<number>
      }>({ name: new FormControl('test'), age: new FormControl(22) })
    })

    it('Should make the FormGroup dirty', () => {
      expect(form.dirty).toBeFalsy()

      form.markAsDirty()

      expect(form.dirty).toBeTruthy()
    })

    it('Should make the FormGroup dirty and call PristineChangeEvent if no options object was passed into the parameters', () => {
      const onPristine = vi.fn()

      expect(form.dirty).toBeFalsy()
      expect(onPristine).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof PristineChangeEvent) {
          onPristine()
        }
      })
      form.markAsDirty()

      expect(form.dirty).toBeTruthy()
      expect(onPristine).toBeCalledTimes(1)
    })

    it('Should make the FormGroup dirty and not call PristineChangeEvent if options object with emitEvent set to false was passed into the parameters', () => {
      const onPristine = vi.fn()

      expect(form.dirty).toBeFalsy()
      expect(onPristine).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof PristineChangeEvent) {
          onPristine()
        }
      })
      form.markAsDirty({ emitEvent: false })

      expect(form.dirty).toBeTruthy()
      expect(onPristine).toBeCalledTimes(0)
    })

    it('Should not call PristineChangeEvent if property _dirty was not changed', () => {
      const onPristine = vi.fn()

      form.markAsDirty()

      expect(form.dirty).toBeTruthy()
      expect(onPristine).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof PristineChangeEvent) {
          onPristine()
        }
      })
      form.markAsDirty()

      expect(form.dirty).toBeTruthy()
      expect(onPristine).toBeCalledTimes(0)
    })
  })

  describe('markAsPristine()', () => {
    let form: FormGroup<{
      name: FormControl<string>
      age: FormControl<number>
    }>

    beforeEach(() => {
      form = new FormGroup<{
        name: FormControl<string>
        surname?: FormControl<string>
        age: FormControl<number>
      }>({ name: new FormControl('test'), age: new FormControl(22) })
    })

    it('Should make the FormGroup pristine', () => {
      form.markAsDirty()

      expect(form.dirty).toBeTruthy()

      form.markAsPristine()

      expect(form.dirty).toBeFalsy()
    })

    it('Should make the FormGroup pristine and call PristineChangeEvent if no options object was passed into the parameters', () => {
      const onPristine = vi.fn()

      form.markAsDirty()

      expect(form.dirty).toBeTruthy()
      expect(onPristine).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof PristineChangeEvent) {
          onPristine()
        }
      })
      form.markAsPristine()

      expect(form.dirty).toBeFalsy()
      expect(onPristine).toBeCalledTimes(1)
    })

    it('Should make the FormGroup pristine and not call PristineChangeEvent if options object with emitEvent set to false was passed into the parameters', () => {
      const onPristine = vi.fn()

      form.markAsDirty()

      expect(form.dirty).toBeTruthy()
      expect(onPristine).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof PristineChangeEvent) {
          onPristine()
        }
      })
      form.markAsPristine({ emitEvent: false })

      expect(form.dirty).toBeFalsy()
      expect(onPristine).toBeCalledTimes(0)
    })

    it('Should not call PristineChangeEvent if property _dirty was not changed', () => {
      const onPristine = vi.fn()

      expect(form.dirty).toBeFalsy()
      expect(onPristine).toBeCalledTimes(0)

      form.events.subscribe((event) => {
        if (event instanceof PristineChangeEvent) {
          onPristine()
        }
      })
      form.markAsPristine()

      expect(form.dirty).toBeFalsy()
      expect(onPristine).toBeCalledTimes(0)
    })
  })
})
