import './style.scss'
import { InputComponent } from './components/input/input.component'
import { fb } from './form/form-builder/form-biulder'
import { BaseComponent } from './utils/base-component'
import { StatusChangeEvent } from './abstract/abstract-control/abstract-control'
import { capitalizeValidator } from './validators/capitalize.validator'

const root = document.getElementById('app')

const name = new InputComponent({
  initialValue: '',
  label: 'Name',
  validators: [capitalizeValidator('ты ЛОШАРА')],
  className: '',
})

const surname = new InputComponent({
  initialValue: '',
  label: 'Surname',
  validators: [],
  className: '',
})

const email = new InputComponent({
  initialValue: '',
  label: 'Email',
  validators: [],
  className: '',
})

const form = fb.group({
  name,
  surname,
  email,
})

const button = new BaseComponent({ tag: 'button', text: 'submit', disabled: !form.valid })

form.events.subscribe((event) => {
  if (event instanceof StatusChangeEvent) {
    if (form.valid) {
      button.node.disabled = false
      return
    }

    button.node.disabled = true
  }
})

root?.append(name.node, surname.node, email.node, button.node)
