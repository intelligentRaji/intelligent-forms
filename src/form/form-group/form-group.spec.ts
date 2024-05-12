import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FormGroup } from './form-group'
import { FormControl } from '../form-control'
import { StatusChangeEvent, ValueChangeEvent } from '@/abstract/abstract-control/abstract-control'
import { fieldEqualityValidator } from '@/validators/field-equality.validator'
import { firstLetterUpperCaseValidtor } from '@/validators/first-letter-upper-case.validator'

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
      const data = new FormGroup({ email: email, age: age })

      const form = new FormGroup({ name: name, data: data })

      expect(form.value).toStrictEqual({ name: 'test', data: { email: 'mail', age: 22 } })
      expect(form.controls).toStrictEqual({ name: name, data: data })
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
    it('Should return controls object', () => {
      const control = new FormControl('test')
      const form = new FormGroup({ test: control })

      expect(form.controls).toStrictEqual({ test: control })
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

    it('The ValueChangeEvent and StatusChange events should be raised if no options object was passed to the parameters.', () => {
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
        name: new FormControl(initialValue.name, [firstLetterUpperCaseValidtor('meesage')]),
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
      expect(form.value).toStrictEqual(initialValue)
    })
  })

  describe.only('get()', () => {
    let form: FormGroup<{
      name: FormControl<string>
      surname?: FormControl<string>
    }>

    beforeEach(() => {
      form = new FormGroup({
        name: new FormControl('Halib'),
        surname: new FormControl('Kashmiri'),
      })
    })

    it('Should return the control if it child of the group', () => {
      const controlName = 'name'
      expect(form.contains(controlName)).toBeTruthy()

      expect(form.g)
    })
  })
})
