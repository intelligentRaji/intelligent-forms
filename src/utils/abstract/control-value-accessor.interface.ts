import { ElementValueType } from '@/types/element-value.type'
import { ControlTags } from './abstract-control'

export interface ControlValueAccessor<
  ControlValue,
  ControlTag extends ControlTags,
  ElementValue = ElementValueType<HTMLElementTagNameMap[ControlTag]>,
> {
  node: HTMLElementTagNameMap[ControlTags]
  transformControlValueToNodeValue(contolValue: ControlValue | ElementValue): ElementValue
  transformNodeValueToControlValue(value: ControlTag | ElementValue): ControlValue
}
