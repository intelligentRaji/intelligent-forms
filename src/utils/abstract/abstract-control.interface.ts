export interface AbstractControlInterface<ControlValue> {
  ControlValueToNodeValue?(contolValue: ControlValue): string
  NodeValueToControlValue?(value: string): ControlValue
}
