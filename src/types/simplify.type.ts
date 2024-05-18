// eslint-disable-next-line @typescript-eslint/ban-types
export type Simplify<T> = { [K in keyof T]: T[K] } & {}
