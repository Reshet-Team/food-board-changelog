import type { Row, Table } from '@tanstack/react-table'
import type { ReactElement } from 'react'

export type RenderDetailPanel<TData> = (props: {
  row: Row<TData>
  table: Table<TData>
}) => ReactElement
