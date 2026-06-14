import type { Dispatch, SetStateAction } from 'react'

/** Shorthand for the setter returned by `useState`. */
export type Setter<T> = Dispatch<SetStateAction<T>>
