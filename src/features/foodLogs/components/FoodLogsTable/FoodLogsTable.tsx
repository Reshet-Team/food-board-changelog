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
import { Input } from '@/components/ui/Input/Input'
import { useToast } from '@/components/ui/Toast/useToast'
import type { FoodLog } from '@/features/foodLogs/types/foodLog'
import { formatSapDate, formatSapTime } from '@/utils/date'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import clsx from 'clsx'
import {
  ArrowLeft,
  FileSearch,
  FileSpreadsheet,
  RotateCw,
  Search,
  TriangleAlert,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
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

// ─── Global search ───────────────────────────────────────────────────────────
// Joins every displayed field of a row — including the human-formatted dates
// and times — into one lowercase haystack so the search bar can match against
// anything the user actually sees in the table.
function rowSearchText(row: FoodLog): string {
  return [
    row.typeOfChange,
    row.material,
    row.quantity,
    formatSapDate(row.consumptionDate),
    row.consumptionDate,
    row.dayInPeriod,
    formatSapDate(row.changeDate),
    row.changeDate,
    formatSapTime(row.changeTime),
    row.changeTime,
    row.changedBy,
    row.field,
    row.oldValue,
    row.newValue,
  ]
    .join(' ')
    .toLowerCase()
}

/** Returns true when the row matches the (already trimmed, lowercased) query. */
function matchesQuery(row: FoodLog, query: string): boolean {
  return rowSearchText(row).includes(query)
}

// TanStack Table global filter: delegates to the shared matcher above so the
// table and the row-count/export stay perfectly in sync.
const globalFilterFn: FilterFn<FoodLog> = (row, _columnId, filterValue: string) =>
  matchesQuery(row.original, filterValue.trim().toLowerCase())

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

// ─── Value change ────────────────────────────────────────────────────────────
// Shows the change inline: the old value (red) with an arrow pointing to the
// new value (green). In RTL the arrow points to the inline-end (left), so the
// flow reads old → new.
function ValueChange({ oldValue, newValue }: { oldValue: string; newValue: string }) {
  return (
    <span className={styles.valueChange}>
      <span className={styles.oldValue}>{oldValue}</span>
      <ArrowLeft className={styles.valueArrow} size="0.85rem" aria-hidden />
      <span className={styles.newValue}>{newValue}</span>
    </span>
  )
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
    header: 'סוג שינוי',
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
  {
    id: 'valueChange',
    header: 'שינוי ערך',
    enableSorting: false,
    cell: ({ row }) => (
      <ValueChange oldValue={row.original.oldValue} newValue={row.original.newValue} />
    ),
  },
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
  const rows = useMemo(() => data ?? [], [data])

  // Free-text search across every column. Kept in component state and fed to the
  // table as a controlled global filter, so the row count and Excel export below
  // reflect exactly what the user sees after filtering.
  const [globalFilter, setGlobalFilter] = useState('')
  const trimmedQuery = globalFilter.trim().toLowerCase()
  const visibleRows = useMemo(
    () => (trimmedQuery ? rows.filter((row) => matchesQuery(row, trimmedQuery)) : rows),
    [rows, trimmedQuery],
  )

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
          <div style={{display: 'flex', gap: '1rem'}}>

          <Input
            size="sm"
            className={styles.searchInput}
            placeholder="חיפוש בכל השדות…"
            aria-label="חיפוש בטבלה"
            value={globalFilter}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setGlobalFilter(event.currentTarget.value)
            }
            startSlot={<Search size="1rem" aria-hidden />}
            />
          <Button variant="secondary" size="sm" onClick={() => exportExcel(visibleRows)}>
            <FileSpreadsheet size="1rem" aria-hidden />
            ייצוא לאקסל
          </Button>
            </div>
          <span className={styles.count}>
            מציג <strong>{visibleRows.length}</strong> שינויים
          </span>
        </div>
      )}
      <DataTableRoot
        columns={columns}
        data={rows}
        isLoading={isLoading}
        loadingRowsCount={LOADING_ROWS}
        className={styles.tableWrapper!}
        globalFilterFn={globalFilterFn}
        state={{ globalFilter }}
        onGlobalFilterChange={setGlobalFilter}
      >
        <DataTableContent>
          <DataTableHeader />
          <DataTableBody emptyMessage="לא נמצאו תוצאות התואמות את החיפוש" />
        </DataTableContent>
      </DataTableRoot>
    </div>
  )
}
