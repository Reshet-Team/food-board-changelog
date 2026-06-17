'use no memo'

import type { Table } from '@tanstack/react-table'
import { useMemo } from 'react'

export function useColumnSizeVars<TData>(table: Table<TData>) {
  const { columnSizingInfo, columnSizing } = table.getState()

  return useMemo(() => {
    const headers = table.getFlatHeaders()
    const columnSizes: { [key: string]: number } = {}

    headers.forEach((header) => {
      columnSizes[`--header-${header.id}-size`] = header.getSize()
      columnSizes[`--col-${header.column.id}-size`] = header.column.getSize()
    })

    return columnSizes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnSizingInfo, columnSizing])
}
