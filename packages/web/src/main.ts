import './style.scss'
import { formBuilder as fb } from 'intelligent-forms'
import { InputNumberComponent } from './components/input-number/input-number.component'
import { InputComponent } from './components/input/input.component'
import { BaseComponent } from './components/base-component/base-component'
import { capitalizeValidator } from './utils/validators/capitalize.validator'
import { minimumNumberValidator } from './utils/validators/minimum-number.validator'
import { requiredValidator } from './utils/validators/required.validator'

const root = document.getElementById('app')

const formElement = new BaseComponent({ tag: 'form', className: 'form' })

const name = new InputComponent({
  label: 'Name',
  control: fb.control('', [
    requiredValidator('This field is required'),
    capitalizeValidator('Name should starts with upper case'),
  ]),
  className: 'name',
})

const surname = new InputComponent({
  label: 'Surname',
  control: fb.control('', [
    requiredValidator('This field is required'),
    capitalizeValidator('Surname should starts with upper case'),
  ]),
  className: 'surname',
})

const age = new InputNumberComponent({
  label: 'Age',
  control: fb.control<number | null>(null, [
    requiredValidator('This field is required'),
    minimumNumberValidator(18, 'You are must be 18 years old'),
  ]),
  className: 'age',
})

const h2 = new BaseComponent({ tag: 'h2', text: 'Address' })

const country = new InputComponent({
  label: 'Country',
  control: fb.control('', [requiredValidator('This field is required')]),
  className: 'country',
})

const city = new InputComponent({
  label: 'City',
  control: fb.control('', [requiredValidator('This field is required')]),
  className: 'city',
})

const form = fb.group({
  name,
  surname,
  age,
  address: {
    country,
    city,
  },
})

const setValue = new BaseComponent({ tag: 'button', text: 'Set value' })

setValue.addListener('click', () => {
  const formValue = { surname: 'qwe', address: { country: 'Belarus' } }
  form.setValue(formValue)
})

const submit = new BaseComponent({ tag: 'button', text: 'Submit', disabled: !form.valid })

form.on('statuschange', ({ status }) => {
  if (status === 'VALID') {
    submit.node.disabled = false
    return
  }

  submit.node.disabled = true
})

formElement.append(name, surname, age, h2, country, city)
root?.append(formElement.node, setValue.node, submit.node)

form.on('valuechange', ({ value }) => {
  console.log(value)
})

/* import { AsdComponent } from './components/asd'
import { formBuilder as fb } from './form/form-builder/form-biulder'
import { capitalizeValidator } from './validators/capitalize.validator'

const name = new AsdComponent({ tag: 'input' })
const surname = new AsdComponent({ tag: 'input' })

const form = fb.group({
  name: fb.control('', [], name),
  surmae: fb.control('', [capitalizeValidator('test')], surname),
})

const root = document.getElementById('app')
root?.append(name.node, surname.node)

form.on('valuechange', () => {
  console.log(form)
}) */
