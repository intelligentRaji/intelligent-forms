export type ElementValueType<T extends { value: unknown }> = T extends { value: infer R } ? R : never
