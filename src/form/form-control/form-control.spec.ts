import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FormControl } from '@/form/form-control/form-control'
import { requiredValidator } from '@/validators/required.validator'
import { ControlStatus } from '@/enums/control-status.enum'
import { capitalizeValidator } from '@/validators/capitalize.validator'
import { PristineChangeEvent, TouchedChangeEvent } from '../../abstract/abstract-control/abstract-control'

describe('FormControl', () => {
  describe('instantiation', () => {
    it('validors property should be an empty array', () => {
      const control = new FormControl('')

      expect(control.validators).toStrictEqual([])
    })

    it('validators property must not be empty if the second parameter is passed to the constructor', () => {
      const control = new FormControl('', [requiredValidator('')])

      expect(control.validators.length).toBe(1)
    })
  })

  describe('getters', () => {
    let control: FormControl<any>
    const validator = requiredValidator('test')

    beforeEach(() => {
      control = new FormControl('', [validator])
    })

    it('value()', () => {
      expect(control.value).toBe('')
    })

    it('touched()', () => {
      expect(control.touched).toBeFalsy()
    })

    it('valid()', () => {
      expect(control.valid).toBeFalsy()
    })

    it('invalid()', () => {
      expect(control.invalid).toBeTruthy()
    })

    it('status()', () => {
      expect(control.status).toBe(ControlStatus.INVALID)
    })

    it('disabled()', () => {
      expect(control.disabled).toBe(false)
    })

    it('enabled()', () => {
      expect(control.enabled).toBe(true)
    })

    it('dirty()', () => {
      expect(control.dirty).toBe(false)
    })

    it('pristine()', () => {
      expect(control.pristine).toBe(true)
    })

    it('errors()', () => {
      expect(control.errors).toStrictEqual(['test'])
    })

    it('validators()', () => {
      expect(control.validators).toStrictEqual([validator])
    })
  })

  describe('validators', () => {
    let control: FormControl<any>
    const validator = requiredValidator('test')

    beforeEach(() => {
      control = new FormControl('')
    })

    describe('addValidators()', () => {
      it('Should add validator to control instance and make it invalid', () => {
        expect(control.validators.includes(validator)).toBeFalsy()
        expect(control.status).toBe(ControlStatus.VALID)

        control.addValidators([validator])

        expect(control.validators.includes(validator)).toBeTruthy()
        expect(control.status).toBe(ControlStatus.INVALID)
      })
    })

    describe('removeValidators()', () => {
      it('Should remove validator from control instance and make it valid', () => {
        control.addValidators([validator])

        expect(control.validators.includes(validator)).toBeTruthy()
        expect(control.status).toBe(ControlStatus.INVALID)

        control.removeValidators([validator])

        expect(control.validators.includes(validator)).toBeFalsy()
        expect(control.status).toBe(ControlStatus.VALID)
      })
    })

    describe('setValidators()', () => {
      it(`Should set _validators propety of control and change status of control`, () => {
        const upperCaseValidator = capitalizeValidator('upperCase')
        control.setValue('test')
        control.addValidators([validator])

        expect(control.validators).toStrictEqual([validator])
        expect(control.status).toBe(ControlStatus.VALID)

        control.setValidators([upperCaseValidator])

        expect(control.validators).toStrictEqual([upperCaseValidator])
        expect(control.status).toBe(ControlStatus.INVALID)
      })
    })

    describe('clearValidators()', () => {
      it(`Should delete all validators from control and change status of control`, () => {
        control.addValidators([validator])

        expect(control.validators.includes(validator)).toBeTruthy()
        expect(control.status).toBe(ControlStatus.INVALID)

        control.clearValidators()

        expect(control.validators).toStrictEqual([])
        expect(control.status).toBe(ControlStatus.VALID)
      })
    })
  })

  describe('disable()', () => {
    it('Should set _disabled propety to true', () => {
      const control = new FormControl('')

      control.disable()

      expect(control.disabled).toBeTruthy()
    })
  })

  describe('enable()', () => {
    it('Should set _disabled propety to false', () => {
      const control = new FormControl('')
      control.disable()

      expect(control.disabled).toBeTruthy()

      control.enable()

      expect(control.enabled).toBeTruthy()
    })
  })

  describe('touched', () => {
    let control: FormControl<any>

    beforeEach(() => {
      control = new FormControl('')
    })

    describe('markAsTouched()', () => {
      it('Should set _touched property of control to true and invoke TouchedChangeEvent', () => {
        const mockFn = vi.fn()

        expect(control.touched).toBeFalsy()

        control.events.subscribe((event) => {
          if (event instanceof TouchedChangeEvent) {
            mockFn()
          }
        })
        control.markAsTouched()

        expect(mockFn).toBeCalledTimes(1)
        expect(control.touched).toBeTruthy()
      })

      it('Should not invoke a TouchedChangeEvent if the value of _touched property has not been changed', () => {
        const mockFn = vi.fn()

        control.markAsTouched()

        expect(control.touched).toBeTruthy()

        control.events.subscribe((event) => {
          if (event instanceof TouchedChangeEvent) {
            mockFn()
          }
        })
        control.markAsTouched()

        expect(mockFn).toBeCalledTimes(0)
      })
    })

    describe('markAsUntouched()', () => {
      it('Should set _touched property of control to false', () => {
        const mockFn = vi.fn()

        control.markAsTouched()
        expect(control.touched).toBeTruthy()

        control.events.subscribe((event) => {
          if (event instanceof TouchedChangeEvent) {
            mockFn()
          }
        })
        control.markAsUntouched()

        expect(mockFn).toBeCalledTimes(1)
        expect(control.touched).toBeFalsy()
      })

      it('Should not invoke a TouchedChangeEvent if the value of _touched property has not been changed', () => {
        const mockFn = vi.fn()

        expect(control.touched).toBeFalsy()

        control.events.subscribe((event) => {
          if (event instanceof TouchedChangeEvent) {
            mockFn()
          }
        })
        control.markAsUntouched()

        expect(mockFn).toBeCalledTimes(0)
      })
    })
  })

  describe('dirty', () => {
    let control: FormControl<any>

    beforeEach(() => {
      control = new FormControl('')
    })

    describe('markAsDirty()', () => {
      it('Should set _dirty property of control to true and invoke a PristineChangeEvent', () => {
        const mockFn = vi.fn()

        expect(control.dirty).toBeFalsy()

        control.events.subscribe((event) => {
          if (event instanceof PristineChangeEvent) {
            mockFn()
          }
        })
        control.markAsDirty()

        expect(mockFn).toBeCalledTimes(1)
        expect(control.dirty).toBeTruthy()
      })

      it('Should not invoke a PristineChangeEvent if the value of _dirty property has not been changed', () => {
        const mockFn = vi.fn()

        control.markAsDirty()

        expect(control.dirty).toBeTruthy()

        control.events.subscribe((event) => {
          if (event instanceof PristineChangeEvent) {
            mockFn()
          }
        })
        control.markAsDirty()

        expect(mockFn).toBeCalledTimes(0)
      })
    })

    describe('markAsPristine()', () => {
      it('Should set _dirty property of control to false and invoke a PristineChangeEvent', () => {
        const mockFn = vi.fn()

        control.markAsDirty()
        expect(control.dirty).toBeTruthy()

        control.events.subscribe((event) => {
          if (event instanceof PristineChangeEvent) {
            mockFn()
          }
        })
        control.markAsPristine()

        expect(mockFn).toBeCalledTimes(1)
        expect(control.dirty).toBeFalsy()
      })

      it('Should not invoke a PristineChangeEvent if the value of _dirty property has not been changed', () => {
        const mockFn = vi.fn()

        expect(control.pristine).toBeTruthy()

        control.events.subscribe((event) => {
          if (event instanceof PristineChangeEvent) {
            mockFn()
          }
        })
        control.markAsPristine()

        expect(mockFn).toBeCalledTimes(0)
      })
    })
  })
})
