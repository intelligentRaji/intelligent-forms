import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FormGroup } from './form-group'
import { FormControl } from '../form-control'
import { StatusChangeEvent, ValueChangeEvent } from '@/abstract/abstract-control/abstract-control'
import { fieldEqualityValidator } from '@/validators/field-equality.validator'

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
          [fieldEqualityValidator(['password', 'fieldPassword'], '')],
        ),
      })
    })

    it('Should set new value and invoke ValueChangeEvent', () => {
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

    it('Should set new value and invoke StatusChangeEvent', () => {
      const onStatus = vi.fn()

      expect(form.value).toStrictEqual({
        name: 'Halib',
        surname: 'Kashmiri',
        data: { password: 'asd', repeatPassword: 'qwe' },
      })

      form.events.subscribe((event) => {
        if (event instanceof StatusChangeEvent) {
          onStatus()
        }
      })
      form.setValue({ data: { password: 'asd', repeatPassword: 'asd' } })

      expect(onStatus).toBeCalledTimes(1)
      expect(form.value).toStrictEqual({
        name: 'Dimas',
        surname: 'Kashmiri',
        data: { password: 'asd', repeatPassword: 'qwe' },
      })
    })
  })
})
