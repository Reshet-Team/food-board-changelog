'use no memo'

import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import type { VirtualItem, Virtualizer } from '@tanstack/react-virtual'
import { useDataTableContext } from './DataTableContext'
import styles from './LoadingRow.module.scss'
import TablePrimitive from './TablePrimitive'

export interface LoadingRowProps {
  index: number
  enableVirtualization?: boolean
  virtualRow?: VirtualItem
  rowVirtualizer?: Virtualizer<HTMLDivElement, Element>
}

export function LoadingRow({
  index,
  enableVirtualization,
  virtualRow,
  rowVirtualizer,
}: LoadingRowProps) {
  const { table } = useDataTableContext()

  return (
    <TablePrimitive.TableRow
      key={`skeleton-${index}`}
      className={styles.tableRow}
      data-index={index}
      data-virtualized={enableVirtualization}
      ref={(node) => {
        rowVirtualizer?.measureElement(node)
      }}
      style={{
        transform: virtualRow ? `translateY(${virtualRow.start}px)` : undefined,
      }}
    >
      {table.getHeaderGroups()[0]?.headers.map((header) => (
        <TablePrimitive.TableCell
          key={header.id}
          className={styles.tableCell}
          data-column-id={header.column.id}
          data-virtualized={enableVirtualization}
          style={{
            flex: enableVirtualization ? `var(--header-${header.id}-size)` : undefined,
            width: !enableVirtualization ? header.getSize() : undefined,
          }}
        >
          <Skeleton className={styles.skeleton} />
        </TablePrimitive.TableCell>
      ))}
    </TablePrimitive.TableRow>
  )
}
