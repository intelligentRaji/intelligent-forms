import './style.scss'
import { InputNumberComponent } from './components/input-number/input-number.component'
import { InputComponent } from './components/input/input.component'
import { ControlStatus } from './enums/control-status.enum'
import { fb } from './form/form-builder/form-biulder'
import { BaseComponent } from './utils/base-component'
import { capitalizeValidator } from './validators/capitalize.validator'
import { minimumNumberValidator } from './validators/minimum-number.validator'
import { requiredValidator } from './validators/required.validator'

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
  control: fb.control<number>(0, [
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
  form.setValue({ name: 'Dima', surname: 'Siarheichyk', age: 22, address: { country: 'Poland', city: 'Bialystok' } })
})

const submit = new BaseComponent({ tag: 'button', text: 'Submit', disabled: !form.valid })

form.on('statuschange', ({ status }) => {
  if (status === ControlStatus.VALID) {
    submit.node.disabled = false
    return
  }

  submit.node.disabled = true
})

form.on('valuechange', (e) => {
  console.log(e.value)
})

formElement.append(name, surname, age, h2, country, city)
root?.append(formElement.node, setValue.node, submit.node)

/* import { AsdComponent } from './components/asd'
import { fb } from './form/form-builder/form-biulder'
import { capitalizeValidator } from './validators/capitalize.validator'

const name = new AsdComponent({ tag: 'input' })
const surname = new AsdComponent({ tag: 'input' })

const form = fb.group({
  name: fb.control('', [], name),
  surmae: fb.control('', [capitalizeValidator('test')], surname),
})

const root = document.getElementById('app')
root?.append(name.node, surname.node)

form.on('valuechange', (e) => {
  console.log(e.value)
}) */
