import type { Row, RowData, Table } from '@tanstack/react-table'
import type { ReactElement } from 'react'

export type RenderDetailPanel<TData> = (props: {
  row: Row<TData>
  table: Table<TData>
}) => ReactElement

declare module '@tanstack/react-table' {
  // Cell renderers return JSX, so exports need a plain-value accessor per column.
  // TValue must keep its name and stay referenced to merge with TanStack's own ColumnMeta.
  interface ColumnMeta<TData extends RowData, TValue> {
    exportValue?: (row: TData, value?: TValue) => string | number
    // For columns that merge several source fields into one cell.
    exportColumns?: { header: string; value: (row: TData) => string | number }[]
  }
}
