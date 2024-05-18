import { capitalizeValidator } from '@/validators/capitalize.validator'
import { describe, expect, it } from 'vitest'
import { minimumLengthValidator } from '@/validators/minimum-length.validator'
import { formBuilder } from './form-biulder'
import { FormGroup } from '../form-group/form-group'
import { FormControl } from '../form-control/form-control'

describe('FormBuilder', () => {
  describe('group()', () => {
    it('Should create a FormGroup receiving an object with values that are arrays of AbstractControl parameters', () => {
      const form = formBuilder.group({
        asd: ['test', [capitalizeValidator('asd')]],
        qwe: ['Test', [capitalizeValidator('qwe')]],
      })

      expect(form).toBeInstanceOf(FormGroup)
    })

    it('Should create a FormGroup receiving an object with values that are instancies inherited from AbstractControl', () => {
      const form = formBuilder.group({
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

      const form = formBuilder.group({
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

      const form = formBuilder.group({
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
})
