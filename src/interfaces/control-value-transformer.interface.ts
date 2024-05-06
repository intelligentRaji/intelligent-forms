import { ElementValueType } from '@/types/element-value.type'
import { FormControlTags } from '../form/form-control'

export interface ControlValueTransformer<
  ControlValue,
  ControlTag extends FormControlTags,
  ElementValue = ElementValueType<HTMLElementTagNameMap[ControlTag]>,
> {
  transformControlValueToNodeValue(contolValue: ControlValue | ElementValue): ElementValue
  transformNodeValueToControlValue(value: ControlTag | ElementValue): ControlValue
}
