import * as React from 'react'

/**
 * Extracts component slot props from a Base UI component namespace.
 *
 * @template Namespace - The `typeof Component` object (e.g., `typeof Menu`)
 * @template IncludedSlots - (Optional) A union of slot names to include (e.g., `'popup' | 'listbox'`)
 */
export type SlotProps<
  Namespace extends Record<string, unknown>,
  IncludedSlots extends SlotNames<Namespace> = SlotNames<Namespace>,
> = Pick<Slots<Namespace>, keyof Slots<Namespace> & `${IncludedSlots & string}Props`>

type ExtractProps<C> =
  C extends React.ForwardRefExoticComponent<infer P>
    ? P
    : C extends React.ComponentType<infer P>
      ? P
      : never

type SlotNames<T extends Record<string, unknown>> = keyof {
  [K in keyof T as ExtractProps<T[K]> extends never ? never : Uncapitalize<K & string>]: true
}

type Slots<T extends Record<string, unknown>> = {
  [K in keyof T as ExtractProps<T[K]> extends never
    ? never
    : `${Uncapitalize<K & string>}Props`]?: Partial<ExtractProps<T[K]>>
}
