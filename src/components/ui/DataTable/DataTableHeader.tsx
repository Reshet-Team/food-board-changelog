'use no memo'

import { flexRender } from '@tanstack/react-table'
import { ColumnHeader } from './ColumnHeader'
import { useDataTableContext } from './DataTableContext'
import styles from './DataTableHeader.module.scss'
import TablePrimitive from './TablePrimitive'

export function DataTableHeader() {
  const { table, enableVirtualization } = useDataTableContext()

  return (
    <TablePrimitive.TableHeader
      className={styles.tableHeader}
      data-virtualized={enableVirtualization}
    >
      {table.getHeaderGroups().map((headerGroup) => (
        <TablePrimitive.TableRow
          key={headerGroup.id}
          className={styles.tableRow}
          data-virtualized={enableVirtualization}
        >
          {headerGroup.headers.map((header) => (
            <TablePrimitive.TableHead
              key={header.id}
              className={styles.tableHead}
              data-column-id={header.column.id}
              data-virtualized={enableVirtualization}
              aria-sort={
                header.column.getIsSorted() === 'asc'
                  ? 'ascending'
                  : header.column.getIsSorted() === 'desc'
                    ? 'descending'
                    : undefined
              }
              style={{
                flex: enableVirtualization ? `var(--header-${header.id}-size)` : undefined,
                width: !enableVirtualization ? header.getSize() : undefined,
              }}
            >
              {header.isPlaceholder ? null : (
                <ColumnHeader column={header.column}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </ColumnHeader>
              )}
            </TablePrimitive.TableHead>
          ))}
        </TablePrimitive.TableRow>
      ))}
    </TablePrimitive.TableHeader>
  )
}
