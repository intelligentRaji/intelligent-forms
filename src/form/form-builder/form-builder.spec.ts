import { capitalizeValidator } from '@/validators/capitalize.validator'
import { describe, expect, it, vi } from 'vitest'
import { minimumLengthValidator } from '@/validators/minimum-length.validator'
import { requiredValidator } from '@/validators/required.validator'
import { ControlValueAccessor } from '@/interfaces/control-value-accessor.interface'
import { fb } from './form-biulder'
import { FormGroup } from '../form-group/form-group'
import { FormControl } from '../form-control/form-control'

describe('FormBuilder', () => {
  describe('group()', () => {
    it('Should create a FormGroup receiving an object with values that are arrays of AbstractControl parameters', () => {
      const form = fb.group({
        asd: ['test', [capitalizeValidator('asd')]],
        qwe: ['Test', [capitalizeValidator('qwe')]],
      })

      expect(form).toBeInstanceOf(FormGroup)
    })

    it('Should create a FormGroup receiving an object with values that are instancies inherited from AbstractControl', () => {
      const form = fb.group({
        asd: new FormControl('asd'),
        qwe: new FormGroup({
          zxc: new FormControl('asd'),
        }),
      })

      expect(form).toBeInstanceOf(FormGroup)
      expect(form.get('qwe')).toBeInstanceOf(FormGroup)
    })

    it('Should create a FormGroup receiving an object with values that are ControlContainer and retrieving AbsctactControl from them', () => {
      const control = new FormControl('asd')

      const controlConainer = {
        control,
      }

      const form = fb.group({
        asd: controlConainer,
      })

      expect(form).toBeInstanceOf(FormGroup)
      expect(form.get('asd')).toBe(control)
    })

    it('Should create a FormGroup taking an object whose values are objects with the same structure as the parameters of FormBuilder.group() method', () => {
      const control = new FormControl('asd')
      const controlConainer = {
        control,
      }

      const form = fb.group({
        asd: {
          asd: controlConainer,
          qwe: new FormControl('asd'),
          zxc: ['asd', [minimumLengthValidator(8, 'asd')]],
        },
      })

      expect(form).toBeInstanceOf(FormGroup)
      expect(form.get('asd')?.get('asd')).toBe(control)
    })
  })

  describe('control()', () => {
    it('Should create a FormControl receiving only initial value', () => {
      const value = 'test'

      const control = fb.control(value)

      expect(control).toBeInstanceOf(FormControl)
      expect(control.value).toBe(value)
    })

    it('Should create a FormControl receiving initial value and validators array', () => {
      const value = 'test'
      const validators = [capitalizeValidator('test'), requiredValidator('test')]

      const control = fb.control(value, validators)

      expect(control).toBeInstanceOf(FormControl)
      expect(control.value).toBe(value)
      expect(control.validators).toStrictEqual(validators)
    })

    it('Should create a FormControl receiving the initial value, validators array, and the object that implements ControlValueAccessorInterface', () => {
      const value = 'test'
      const validators = [capitalizeValidator('test'), requiredValidator('test')]
      const obj: ControlValueAccessor<string> = {
        onTouch(): void {},
        onChange(): void {},
        writeValue(): void {},
      }

      const writeValue = vi.spyOn(obj, 'writeValue')
      const control = fb.control(value, validators, obj)

      expect(control).toBeInstanceOf(FormControl)
      expect(control.value).toBe(value)
      expect(control.validators).toStrictEqual(validators)

      control.setValue('123')
      expect(writeValue).toBeCalledTimes(2)
    })
  })
})
