'use no memo'

import { Button } from '@/components/ui/Button/Button'
import type { Column } from '@tanstack/react-table'
import clsx from 'clsx'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import type { HTMLAttributes, PropsWithChildren } from 'react'
import styles from './ColumnHeader.module.scss'

interface ColumnHeaderProps<TData, TValue>
  extends HTMLAttributes<HTMLDivElement>, PropsWithChildren {
  column: Column<TData, TValue>
}

export function ColumnHeader<TData, TValue>({
  column,
  className,
  children,
}: ColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort() || !children) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={clsx(styles.columnHeader, className)}>
      <Button className={styles.button} variant="ghost" onClick={column.getToggleSortingHandler()}>
        <span>{children}</span>
        {column.getIsSorted() === 'desc' ? (
          <ArrowDown size="1rem" />
        ) : column.getIsSorted() === 'asc' ? (
          <ArrowUp size="1rem" />
        ) : (
          <ChevronsUpDown size="1rem" />
        )}
      </Button>
    </div>
  )
}
