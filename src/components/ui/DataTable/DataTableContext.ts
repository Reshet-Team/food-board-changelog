import type { Table } from '@tanstack/react-table'
import type { Virtualizer } from '@tanstack/react-virtual'
import { createContext, use, type RefObject } from 'react'
import type { RenderDetailPanel } from './types'

export interface DataTableContextValue<TData = unknown> {
  table: Table<TData>
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>
  tableContainerRef: RefObject<HTMLDivElement | null>
  enableVirtualization?: boolean
  renderDetailPanel?: RenderDetailPanel<TData>
  columnSizeVars: Record<string, number>
  isLoading?: boolean
  loadingRowsCount: number
}

export const DataTableContext = createContext<DataTableContextValue | null>(null)

export function useDataTableContext<TData = unknown>(): DataTableContextValue<TData> {
  const ctx = use(DataTableContext)
  if (!ctx) throw new Error('useDataTableContext must be used within DataTableRoot')
  return ctx as DataTableContextValue<TData>
}
