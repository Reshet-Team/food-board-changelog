import clsx from 'clsx'
import type { ComponentProps } from 'react'
import styles from './TablePrimitive.module.scss'

function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div data-slot="table-container" className={styles.tableContainer}>
      <table data-slot="table" className={clsx(styles.table, className)} {...props} />
    </div>
  )
}

function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return (
    <thead data-slot="table-header" className={clsx(styles.tableHeader, className)} {...props} />
  )
}

function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={clsx(styles.tableBody, className)} {...props} />
}

function TableFooter({ className, ...props }: ComponentProps<'tfoot'>) {
  return (
    <tfoot data-slot="table-footer" className={clsx(styles.tableFooter, className)} {...props} />
  )
}

function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return <tr data-slot="table-row" className={clsx(styles.tableRow, className)} {...props} />
}

function TableHead({ className, ...props }: ComponentProps<'th'>) {
  return <th data-slot="table-head" className={clsx(styles.tableHead, className)} {...props} />
}

function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return <td data-slot="table-cell" className={clsx(styles.tableCell, className)} {...props} />
}

function TableCaption({ className, ...props }: ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={clsx(styles.tableCaption, className)}
      {...props}
    />
  )
}

export default {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
}
