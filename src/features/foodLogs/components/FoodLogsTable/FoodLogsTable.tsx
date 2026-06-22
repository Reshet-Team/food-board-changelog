'use no memo' // TanStack Table doesn't support the React Compiler yet

import { Button } from '@/components/ui/Button/Button'
import {
  DataTableBody,
  DataTableContent,
  DataTableHeader,
  DataTableRoot,
} from '@/components/ui/DataTable/DataTable'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/Empty/Empty'
import { useToast } from '@/components/ui/Toast/useToast'
import type { FoodLog } from '@/features/foodLogs/types/foodLog'
import { formatSapDate, formatSapTime } from '@/utils/date'
import type { ColumnDef } from '@tanstack/react-table'
import clsx from 'clsx'
import { FileSearch, FileSpreadsheet, RotateCw, TriangleAlert } from 'lucide-react'
import { useEffect } from 'react'
import * as XLSX from 'xlsx'
import styles from './FoodLogsTable.module.scss'

// Number of skeleton rows to show while a fetch is in flight.
const LOADING_ROWS = 12

// ─── Excel export ────────────────────────────────────────────────────────────
// Column labels for the exported sheet, kept in step with the table below.
const EXCEL_HEADERS = [
  'סוג שינוי',
  'חומר',
  'כמות',
  'תאריך צריכה',
  'יום בתקופה',
  'תאריך שינוי',
  'שעת שינוי',
  'שונה ע"י',
  'שדה',
  'ערך ישן',
  'ערך חדש',
]

/** Builds a real .xlsx workbook from the current rows and downloads it. */
function exportExcel(rows: FoodLog[]): void {
  const body = rows.map((row) => [
    row.typeOfChange,
    row.material,
    row.quantity,
    formatSapDate(row.consumptionDate),
    row.dayInPeriod,
    formatSapDate(row.changeDate),
    formatSapTime(row.changeTime),
    row.changedBy,
    row.field,
    row.oldValue,
    row.newValue,
  ])
  const worksheet = XLSX.utils.aoa_to_sheet([EXCEL_HEADERS, ...body])
  worksheet['!cols'] = EXCEL_HEADERS.map(() => ({ wch: 16 }))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'שינויים')
  XLSX.writeFile(workbook, `food-logs-${new Date().toISOString().slice(0, 10)}.xlsx`)
}

// ─── Change-type badge ───────────────────────────────────────────────────────
// Colours the pill by the action verb at the start of the change description:
// add → green, delete → red, anything else (update/edit) → amber.
function ChangeTypeBadge({ value }: { value: string }) {
  const tone = value.startsWith('הוספ')
    ? styles.badgeAdd
    : value.startsWith('מחיק')
      ? styles.badgeDelete
      : styles.badgeUpdate
  return <span className={clsx(styles.badge, tone)}>{value}</span>
}

// ─── Column definitions ──────────────────────────────────────────────────────
// All data columns are sortable (TanStack Table's default). Date/time columns
// store the raw SAP wire value (so sorting stays correct) and format on display.
const columns: ColumnDef<FoodLog>[] = [
  {
    id: 'rowNumber',
    header: '#',
    size: 56,
    enableSorting: false,
    // Continuous 1-based counter following the current sort order, padded to
    // two digits (01, 02, …) like the design.
    cell: ({ row, table }) => {
      const position = table.getSortedRowModel().rows.findIndex((r) => r.id === row.id)
      return <span className={styles.rowNumber}>{String(position + 1).padStart(2, '0')}</span>
    },
  },
  {
    accessorKey: 'typeOfChange',
    header: 'סוג',
    cell: ({ getValue }) => <ChangeTypeBadge value={getValue<string>()} />,
  },
  { accessorKey: 'material', header: 'חומר' },
  { accessorKey: 'quantity', header: 'כמות' },
  {
    accessorKey: 'consumptionDate',
    header: 'תאריך צריכה',
    cell: ({ getValue }) => formatSapDate(getValue<string>()),
  },
  { accessorKey: 'dayInPeriod', header: 'יום בתקופה' },
  {
    accessorKey: 'changeDate',
    header: 'תאריך שינוי',
    cell: ({ getValue }) => formatSapDate(getValue<string>()),
  },
  {
    accessorKey: 'changeTime',
    header: 'שעת שינוי',
    cell: ({ getValue }) => formatSapTime(getValue<string>()),
  },
  { accessorKey: 'changedBy', header: 'שונה ע"י' },
  { accessorKey: 'field', header: 'שדה' },
  { accessorKey: 'oldValue', header: 'ערך ישן' },
  { accessorKey: 'newValue', header: 'ערך חדש' },
]

export interface FoodLogsTableProps {
  data: FoodLog[] | undefined
  isLoading: boolean
  isError: boolean
  /** Whether a search has been submitted (mandatory fields filled). */
  hasSearched: boolean
  onRetry: () => void
}

export function FoodLogsTable({
  data,
  isLoading,
  isError,
  hasSearched,
  onRetry,
}: FoodLogsTableProps) {
  const toast = useToast()
  const rows = data ?? []

  // Surface a toast whenever a fetch fails. Depend only on `isError` — the toast
  // manager object identity changes every render, so including it would loop.
  useEffect(() => {
    if (!isError) return
    toast.add({
      type: 'error',
      title: 'שגיאה בטעינת הנתונים',
      description: 'לא ניתן לטעון את רשומות השינויים. נסה שוב.',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError])

  // ─── Idle — no search submitted yet ────────────────────────────────────────
  if (!hasSearched) {
    return (
      <div className={styles.stateCard}>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileSearch aria-hidden />
            </EmptyMedia>
            <EmptyTitle>מלא את הטופס כדי להציג תוצאות</EmptyTitle>
            <EmptyDescription>בחר לוח מזון, חלופה וטווח תאריכים ולחץ על חפש.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  // ─── Error ─────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className={styles.stateCard}>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TriangleAlert aria-hidden />
            </EmptyMedia>
            <EmptyTitle>שגיאה בטעינת הנתונים</EmptyTitle>
            <EmptyDescription>אירעה שגיאה בעת טעינת רשומות השינויים.</EmptyDescription>
          </EmptyHeader>
          <Button variant="secondary" onClick={onRetry}>
            <RotateCw size="1rem" aria-hidden />
            נסה שוב
          </Button>
        </Empty>
      </div>
    )
  }

  // ─── Empty — successful fetch, zero rows ───────────────────────────────────
  if (!isLoading && data && data.length === 0) {
    return (
      <div className={styles.stateCard}>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileSearch aria-hidden />
            </EmptyMedia>
            <EmptyTitle>לא נמצאו תוצאות</EmptyTitle>
            <EmptyDescription>נסה לשנות את תנאי החיפוש.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  // ─── Loading / Success ─────────────────────────────────────────────────────
  return (
    <div className={styles.tableArea}>
      {rows.length > 0 && (
        <div className={styles.tableToolbar}>
          <span className={styles.count}>
            מציג <strong>{rows.length}</strong> שינויים
          </span>
          <Button variant="secondary" size="sm" onClick={() => exportExcel(rows)}>
            <FileSpreadsheet size="1rem" aria-hidden />
            ייצוא לאקסל
          </Button>
        </div>
      )}
      <DataTableRoot
        columns={columns}
        data={rows}
        isLoading={isLoading}
        loadingRowsCount={LOADING_ROWS}
        className={styles.tableWrapper!}
      >
        <DataTableContent>
          <DataTableHeader />
          <DataTableBody />
        </DataTableContent>
      </DataTableRoot>
    </div>
  )
}
