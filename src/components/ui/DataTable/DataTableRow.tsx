'use no memo'

import { Collapsible } from '@base-ui/react/collapsible'
import { flexRender, type Row } from '@tanstack/react-table'
import type { VirtualItem, Virtualizer } from '@tanstack/react-virtual'
import { Fragment, type RefObject } from 'react'
import { useDataTableContext } from './DataTableContext'
import styles from './DataTableRow.module.scss'
import TablePrimitive from './TablePrimitive'

export interface DataTableRowProps<TData> {
  row: Row<TData>
  enableVirtualization?: boolean
  virtualRow?: VirtualItem
  rowVirtualizer?: Virtualizer<HTMLDivElement, Element>
  rowsRef?: RefObject<Record<string, HTMLTableRowElement | null>>
  ref?: RefObject<HTMLTableRowElement | null>
}

export function DataTableRow<TData>({
  row,
  rowsRef,
  enableVirtualization,
  virtualRow,
  rowVirtualizer,
  ref,
}: DataTableRowProps<TData>) {
  const { table, renderDetailPanel } = useDataTableContext<TData>()

  const rowIndex = renderDetailPanel ? row.index * 2 : row.index
  const detailPanelIndex = rowIndex + 1
  const detailVirtualItem = rowVirtualizer
    ?.getVirtualItems()
    .find((v) => v.index === detailPanelIndex)

  return (
    <Fragment>
      <TablePrimitive.TableRow
        className={styles.tableRow}
        data-index={rowIndex}
        data-state={row.getIsSelected() && 'selected'}
        data-virtualized={enableVirtualization}
        ref={(node) => {
          rowVirtualizer?.measureElement(node)
          if (rowsRef) {
            rowsRef.current[row.id] = node
          }
          if (ref) {
            ref.current = node
          }
        }}
        style={{
          transform: virtualRow ? `translateY(${virtualRow.start}px)` : undefined,
        }}
      >
        {row.getVisibleCells().map((cell) => (
          <TablePrimitive.TableCell
            key={cell.id}
            className={styles.tableCell}
            data-column-id={cell.column.id}
            data-virtualized={enableVirtualization}
            style={{
              flex: enableVirtualization ? `var(--col-${cell.column.id}-size)` : undefined,
              width: !enableVirtualization ? cell.column.getSize() : undefined,
            }}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TablePrimitive.TableCell>
        ))}
      </TablePrimitive.TableRow>

      {renderDetailPanel && row.getCanExpand() && (
        <tr
          className={styles.tableRow}
          data-detail-panel
          data-index={detailPanelIndex}
          data-virtualized={enableVirtualization}
          ref={rowVirtualizer ? (node) => rowVirtualizer.measureElement(node) : undefined}
          style={{
            transform: detailVirtualItem ? `translateY(${detailVirtualItem.start}px)` : undefined,
          }}
        >
          <td
            className={styles.detailPanelCell}
            data-virtualized={enableVirtualization}
            colSpan={row.getVisibleCells().length}
          >
            {enableVirtualization ? (
              row.getIsExpanded() && (
                <div className={styles.virtualDetailPanel}>{renderDetailPanel({ row, table })}</div>
              )
            ) : (
              <Collapsible.Root open={row.getIsExpanded()}>
                <Collapsible.Panel className={styles.collapsiblePanel}>
                  {renderDetailPanel({ row, table })}
                </Collapsible.Panel>
              </Collapsible.Root>
            )}
          </td>
        </tr>
      )}
    </Fragment>
  )
}
