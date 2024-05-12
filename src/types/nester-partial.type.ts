export type NestedPartial<T extends object> = { [K in keyof T]?: T[K] extends object ? NestedPartial<T[K]> : T[K] }
