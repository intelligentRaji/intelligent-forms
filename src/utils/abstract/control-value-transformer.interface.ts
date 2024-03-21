import { ElementValueType } from '@/types/element-value.type'
import { FormContolTags } from './abstract-form-control'

export interface ControlValueTransformer<
  ControlValue,
  ControlTag extends FormContolTags,
  ElementValue = ElementValueType<HTMLElementTagNameMap[ControlTag]>,
> {
  transformControlValueToNodeValue(contolValue: ControlValue | ElementValue): ElementValue
  transformNodeValueToControlValue(value: ControlTag | ElementValue): ControlValue
}
