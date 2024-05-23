import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FormControl } from '@/form/form-control/form-control'
import { requiredValidator } from '@/validators/required.validator'
import { capitalizeValidator } from '@/validators/capitalize.validator'

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

    it('status()', () => {
      expect(control.status).toBe('INVALID')
    })

    it('disabled()', () => {
      expect(control.disabled).toBe(false)
    })

    it('dirty()', () => {
      expect(control.dirty).toBe(false)
    })

    it('errors()', () => {
      expect(control.errors).toStrictEqual(['test'])
    })

    it('validators()', () => {
      expect(control.validators).toStrictEqual([validator])
    })
  })

  describe('on()', () => {
    const value = 'test'
    let control: FormControl<string>

    beforeEach(() => {
      control = new FormControl(value, [capitalizeValidator('test')])
    })
    it('Should response only on ValueChangeEvent if the "valuechange" was passed as first parameter into the parameters', () => {
      const event = 'valuechange'
      const newValue = 'Asd'
      const onValueChange = vi.fn()

      expect(control.value).toBe(value)
      expect(onValueChange).toBeCalledTimes(0)

      control.on(event, onValueChange)
      control.setValue(newValue)

      expect(control.value).toBe(newValue)
      expect(onValueChange).toBeCalledTimes(1)
    })

    it('Should response only on StatusChangeEvent if the "statuschange" was passed as first parameter into the parameters', () => {
      const event = 'statuschange'
      const newValue = 'Asd'
      const onStatus = vi.fn()

      expect(control.value).toBe(value)
      expect(control.valid).toBeFalsy()
      expect(onStatus).toBeCalledTimes(0)

      control.on(event, onStatus)
      control.setValue(newValue)

      expect(control.value).toBe(newValue)
      expect(control.valid).toBeTruthy()
      expect(onStatus).toBeCalledTimes(1)
    })

    it('Should response only on DisabledChangeEvent if the "disabledchange" was passed as first parameter into the parameters', () => {
      const event = 'disabledchange'
      const onDisable = vi.fn()

      expect(control.disabled).toBeFalsy()
      expect(onDisable).toBeCalledTimes(0)

      control.on(event, onDisable)
      control.disable()

      expect(control.disabled).toBeTruthy()
      expect(onDisable).toBeCalledTimes(1)
    })

    it('Should response only on TouchedChangeEvent if the "touchedchange" was passed as first parameter into the parameters', () => {
      const event = 'touchedchange'
      const onTouch = vi.fn()

      expect(control.touched).toBeFalsy()
      expect(onTouch).toBeCalledTimes(0)

      control.on(event, onTouch)
      control.markAsTouched()

      expect(control.touched).toBeTruthy()
      expect(onTouch).toBeCalledTimes(1)
    })

    it('Should response only on PristineChangeEvent if the "pristinechange" was passed as first parameter into the parameters', () => {
      const event = 'pristinechange'
      const onPrisitne = vi.fn()

      expect(control.dirty).toBeFalsy()
      expect(onPrisitne).toBeCalledTimes(0)

      control.on(event, onPrisitne)
      control.markAsDirty()

      expect(control.dirty).toBeTruthy()
      expect(onPrisitne).toBeCalledTimes(1)
    })

    it('Should response only on all the ControlEvents if the "change" was passed as first parameter into the parameters', () => {
      const event = 'change'
      const newValue = 'Asd'
      const onChange = vi.fn()

      expect(control.disabled).toBeFalsy()
      expect(control.touched).toBeFalsy()
      expect(control.dirty).toBeFalsy()
      expect(control.valid).toBeFalsy()
      expect(control.value).toBe(value)
      expect(onChange).toBeCalledTimes(0)

      control.on(event, onChange)
      control.setValue(newValue)
      control.markAsDirty()
      control.markAsTouched()
      control.disable()

      expect(control.disabled).toBeTruthy()
      expect(control.touched).toBeTruthy()
      expect(control.dirty).toBeTruthy()
      expect(control.valid).toBeTruthy()
      expect(control.value).toBe(newValue)
      expect(onChange).toBeCalledTimes(5)
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
        expect(control.status).toBe('VALID')

        control.addValidators([validator])

        expect(control.validators.includes(validator)).toBeTruthy()
        expect(control.status).toBe('INVALID')
      })
    })

    describe('removeValidators()', () => {
      it('Should remove validator from control instance and make it valid', () => {
        control.addValidators([validator])

        expect(control.validators.includes(validator)).toBeTruthy()
        expect(control.status).toBe('INVALID')

        control.removeValidators([validator])

        expect(control.validators.includes(validator)).toBeFalsy()
        expect(control.status).toBe('VALID')
      })
    })

    describe('setValidators()', () => {
      it(`Should set _validators propety of control and change status of control`, () => {
        const upperCaseValidator = capitalizeValidator('upperCase')
        control.setValue('test')
        control.addValidators([validator])

        expect(control.validators).toStrictEqual([validator])
        expect(control.status).toBe('VALID')

        control.setValidators([upperCaseValidator])

        expect(control.validators).toStrictEqual([upperCaseValidator])
        expect(control.status).toBe('INVALID')
      })
    })

    describe('clearValidators()', () => {
      it(`Should delete all validators from control and change status of control`, () => {
        control.addValidators([validator])

        expect(control.validators.includes(validator)).toBeTruthy()
        expect(control.status).toBe('INVALID')

        control.clearValidators()

        expect(control.validators).toStrictEqual([])
        expect(control.status).toBe('VALID')
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

      expect(control.disabled).toBeFalsy()
    })
  })

  describe('touched', () => {
    let control: FormControl<any>

    beforeEach(() => {
      control = new FormControl('')
    })

    describe('markAsTouched()', () => {
      it('Should set _touched property of control to true and invoke TouchedChangeEvent', () => {
        const onTouch = vi.fn()

        expect(control.touched).toBeFalsy()

        control.on('touchedchange', onTouch)
        control.markAsTouched()

        expect(onTouch).toBeCalledTimes(1)
        expect(control.touched).toBeTruthy()
      })

      it('Should not invoke a TouchedChangeEvent if the value of _touched property has not been changed', () => {
        const onTouch = vi.fn()

        control.markAsTouched()

        expect(control.touched).toBeTruthy()

        control.on('touchedchange', onTouch)
        control.markAsTouched()

        expect(onTouch).toBeCalledTimes(0)
      })
    })

    describe('markAsUntouched()', () => {
      it('Should set _touched property of control to false', () => {
        const onTouch = vi.fn()

        control.markAsTouched()
        expect(control.touched).toBeTruthy()

        control.on('touchedchange', onTouch)
        control.markAsUntouched()

        expect(onTouch).toBeCalledTimes(1)
        expect(control.touched).toBeFalsy()
      })

      it('Should not invoke a TouchedChangeEvent if the value of _touched property has not been changed', () => {
        const onTouch = vi.fn()

        expect(control.touched).toBeFalsy()

        control.on('touchedchange', onTouch)
        control.markAsUntouched()

        expect(onTouch).toBeCalledTimes(0)
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
        const onPristine = vi.fn()

        expect(control.dirty).toBeFalsy()

        control.on('pristinechange', onPristine)
        control.markAsDirty()

        expect(onPristine).toBeCalledTimes(1)
        expect(control.dirty).toBeTruthy()
      })

      it('Should not invoke a PristineChangeEvent if the value of _dirty property has not been changed', () => {
        const onPristine = vi.fn()

        control.markAsDirty()

        expect(control.dirty).toBeTruthy()

        control.on('pristinechange', onPristine)
        control.markAsDirty()

        expect(onPristine).toBeCalledTimes(0)
      })
    })

    describe('markAsPristine()', () => {
      it('Should set _dirty property of control to false and invoke a PristineChangeEvent', () => {
        const onPristine = vi.fn()

        control.markAsDirty()
        expect(control.dirty).toBeTruthy()

        control.on('pristinechange', onPristine)
        control.markAsPristine()

        expect(onPristine).toBeCalledTimes(1)
        expect(control.dirty).toBeFalsy()
      })

      it('Should not invoke a PristineChangeEvent if the value of _dirty property has not been changed', () => {
        const onPristine = vi.fn()

        expect(control.dirty).toBeFalsy()

        control.on('pristinechange', onPristine)
        control.markAsPristine()

        expect(onPristine).toBeCalledTimes(0)
      })
    })
  })
})
