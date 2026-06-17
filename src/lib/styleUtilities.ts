import type * as React from 'react'

/**
 * Extracts component slot props from a Base UI component namespace.
 *
 * @template Namespace - The `typeof Component` object (e.g., `typeof Menu`)
 * @template IncludedSlots - (Optional) A union of slot names to include (e.g., `'popup' | 'listbox'`)
 */
export type SlotProps<
  TNamespace extends Record<string, unknown>,
  TIncludedSlots extends SlotNames<TNamespace> = SlotNames<TNamespace>,
> = Pick<Slots<TNamespace>, keyof Slots<TNamespace> & `${TIncludedSlots & string}Props`>

type ExtractProps<TComponent> =
  TComponent extends React.ForwardRefExoticComponent<infer P>
    ? P
    : TComponent extends React.ComponentType<infer P>
      ? P
      : never

type SlotNames<TNamespace extends Record<string, unknown>> = keyof {
  [K in keyof TNamespace as ExtractProps<TNamespace[K]> extends never
    ? never
    : Uncapitalize<K & string>]: true
}

type Slots<TNamespace extends Record<string, unknown>> = {
  [K in keyof TNamespace as ExtractProps<TNamespace[K]> extends never
    ? never
    : `${Uncapitalize<K & string>}Props`]?: Partial<ExtractProps<TNamespace[K]>>
}
