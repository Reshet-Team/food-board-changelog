import { type ColumnDef } from '@tanstack/react-table'
import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'
import styles from './expandColumnDef.module.scss'

export const expandColumnDef: ColumnDef<unknown> = {
  id: 'expand',
  header: () => null,
  cell: ({ row }) => {
    return row.getCanExpand() ? (
      <button
        className={styles.expandButton}
        onClick={row.getToggleExpandedHandler()}
        aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
        aria-expanded={row.getIsExpanded()}
      >
        <ChevronDown className={clsx(styles.chevron)} data-expanded={row.getIsExpanded()} />
      </button>
    ) : null
  },
  minSize: 1,
  size: 1,
  maxSize: 1,
}
