'use no memo'

import type { RefObject } from 'react'
import styles from './DataTableBody.module.scss'
import { useDataTableContext } from './DataTableContext'
import { DataTableRow } from './DataTableRow'
import { Empty } from './Empty'
import { LoadingRow } from './LoadingRow'
import TablePrimitive from './TablePrimitive'

export interface DataTableBodyProps {
  rowsRef?: RefObject<Record<string, HTMLTableRowElement | null>>
  lastRowRef?: RefObject<HTMLTableRowElement | null>

  emptyMessage?: string
}

export function DataTableBody({ rowsRef, lastRowRef, emptyMessage }: DataTableBodyProps) {
  const {
    table,
    rowVirtualizer,
    enableVirtualization,
    renderDetailPanel,
    isLoading,
    loadingRowsCount,
  } = useDataTableContext()

  const { rows } = table.getRowModel()
  const virtualItems = rowVirtualizer.getVirtualItems()

  return (
    <TablePrimitive.TableBody
      className={styles.tableBody}
      data-virtualized={enableVirtualization}
      style={{
        height: enableVirtualization ? `${rowVirtualizer.getTotalSize()}px` : undefined,
      }}
    >
      {isLoading ? (
        enableVirtualization ? (
          virtualItems.map((virtualRow) => (
            <LoadingRow
              key={virtualRow.key}
              index={virtualRow.index}
              enableVirtualization
              rowVirtualizer={rowVirtualizer}
              virtualRow={virtualRow}
            />
          ))
        ) : (
          Array.from({ length: loadingRowsCount }).map((_, index) => (
            <LoadingRow key={`skeleton-${index}`} index={index} />
          ))
        )
      ) : rows.length ? (
        enableVirtualization ? (
          virtualItems.map((virtualRow) => {
            if (renderDetailPanel && virtualRow.index % 2 === 1) {
              return null
            }

            const staticIndex = renderDetailPanel ? virtualRow.index / 2 : virtualRow.index
            const rowData = rows[staticIndex]

            if (!rowData) {
              return null
            }

            return (
              <DataTableRow
                key={virtualRow.key}
                {...(rowsRef ? { rowsRef } : {})}
                row={rowData}
                enableVirtualization
                rowVirtualizer={rowVirtualizer}
                virtualRow={virtualRow}
                {...(virtualRow.index === virtualItems[virtualItems.length - 1]?.index && lastRowRef
                  ? { ref: lastRowRef }
                  : {})}
              />
            )
          })
        ) : (
          rows.map((row, index) => (
            <DataTableRow
              key={row.id}
              {...(rowsRef ? { rowsRef } : {})}
              row={row}
              {...(index === rows.length - 1 && lastRowRef ? { ref: lastRowRef } : {})}
            />
          ))
        )
      ) : (
        <Empty {...(emptyMessage !== undefined ? { message: emptyMessage } : {})} />
      )}
    </TablePrimitive.TableBody>
  )
}
