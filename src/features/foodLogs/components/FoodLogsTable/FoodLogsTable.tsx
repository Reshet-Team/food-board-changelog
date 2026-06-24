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
import { TooltipContent, TooltipRoot, TooltipTrigger } from '@/components/ui/Tooltip/Tooltip'
import type { FoodLog } from '@/features/foodLogs/types/foodLog'
import { changeTypeLabel, classifyChangeType } from '@/features/foodLogs/utils/changeType'
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
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import * as XLSX from 'xlsx'
import styles from './FoodLogsTable.module.scss'

// Number of skeleton rows to show while a fetch is in flight.
const LOADING_ROWS = 12

// ─── Excel export ────────────────────────────────────────────────────────────
// Column labels for the exported sheet, kept in step with the table below.
const EXCEL_HEADERS = [
  'תאריך שינוי',
  'שעת שינוי',
  'סוג שינוי',
  'חומר',
  'כמות',
  'תאריך צריכה',
  'יום בתקופה',
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
    changeTypeLabel(row.typeOfChange),
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
    formatSapDate(row.changeDate),
    formatSapTime(row.changeTime),
    changeTypeLabel(row.typeOfChange),
    row.material,
    row.quantity,
    formatSapDate(row.consumptionDate),
    row.dayInPeriod ?? '',
    row.changedBy,
    row.field,
    row.oldValue,
    row.newValue,
  ])
  const worksheet = XLSX.utils.aoa_to_sheet([EXCEL_HEADERS, ...body])
  worksheet['!cols'] = EXCEL_HEADERS.map(() => ({ wch: 16 }))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'שינויים')
  XLSX.writeFile(workbook, `Food_Logs_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

// ─── Change-type badge ───────────────────────────────────────────────────────
// Translates the raw SAP indicator code (U / E / D / I / J) into a Hebrew label
// and colours the pill by category: add → green, delete → red, update → amber.
function ChangeTypeBadge({ code }: { code: string }) {
  const category = classifyChangeType(code)
  const tone =
    category === 'add'
      ? styles.badgeAdd
      : category === 'delete'
        ? styles.badgeDelete
        : styles.badgeUpdate
  return <span className={clsx(styles.badge, tone)}>{changeTypeLabel(code)}</span>
}

// ─── Clip detection ──────────────────────────────────────────────────────────
// Only a single unbroken token (an 18-digit material number, a username) is
// clipped with an ellipsis; a value containing a space is allowed to wrap onto
// the next line instead. This hook watches the rendered width and reports
// whether a single-token value actually overflows its cell. Column widths are
// responsive, so it re-measures whenever the cell is resized.
function useClip(value: string) {
  const ref = useRef<HTMLSpanElement>(null)
  const [isClipped, setIsClipped] = useState(false)

  const trimmed = value.trim()
  const isSingleToken = trimmed.length > 0 && !/\s/.test(trimmed)

  useEffect(() => {
    const el = ref.current
    if (!el || !isSingleToken) {
      setIsClipped(false)
      return
    }
    const measure = () => setIsClipped(el.scrollWidth > el.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [value, isSingleToken])

  return { ref, isClipped, isSingleToken }
}

// ─── Text cell ───────────────────────────────────────────────────────────────
// Renders a single value. A value with no spaces (e.g. a long number) stays on
// one line and truncates with an ellipsis — the full text shows in the tooltip
// on hover; a value with spaces wraps onto new lines between words. The Reshet
// tooltip is always mounted so the measured span never remounts; it only opens
// (`disabled={!isClipped}`) when the value actually overflows.
function TextCell({ value, className }: { value: string; className?: string | undefined }) {
  const { ref, isClipped, isSingleToken } = useClip(value)
  return (
    <TooltipRoot>
      <TooltipTrigger
        disabled={!isClipped}
        render={
          <span
            ref={ref}
            className={clsx(isSingleToken ? styles.truncate : styles.wrap, className)}
          >
            {value}
          </span>
        }
      />
      <TooltipContent>{value}</TooltipContent>
    </TooltipRoot>
  )
}

// ─── Value change ────────────────────────────────────────────────────────────
// Shows an update as the old value (red) and new value (green) with an arrow
// between them. They sit side by side on one line while they fit, and only wrap
// onto a new line when the pair is too wide for the column. Each value reuses
// `TextCell`, so a long number truncates (with a hover tooltip) while free text
// wraps.
function ValueChange({ oldValue, newValue }: { oldValue: string; newValue: string }) {
  return (
    <span className={styles.valueChange}>
      <TextCell value={oldValue} className={styles.oldValue} />
      <ArrowLeft className={styles.valueArrow} size="0.85rem" aria-hidden />
      <TextCell value={newValue} className={styles.newValue} />
    </span>
  )
}

// ─── Column definitions ──────────────────────────────────────────────────────
// All data columns are sortable (TanStack Table's default). Date/time columns
// store the raw SAP wire value (so sorting stays correct) and format on display.
const columns: ColumnDef<FoodLog>[] = [
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
  {
    accessorKey: 'typeOfChange',
    header: 'סוג שינוי',
    cell: ({ getValue }) => <ChangeTypeBadge code={getValue<string>()} />,
  },
  {
    accessorKey: 'material',
    header: 'חומר',
    cell: ({ getValue }) => <TextCell value={getValue<string>()} />,
  },
  {
    accessorKey: 'quantity',
    header: 'כמות',
    cell: ({ getValue }) => <TextCell value={String(getValue<number>())} />,
  },
  {
    accessorKey: 'consumptionDate',
    header: 'תאריך צריכה',
    cell: ({ getValue }) => formatSapDate(getValue<string | undefined>()),
  },
  {
    accessorKey: 'dayInPeriod',
    header: 'יום בתקופה',
    cell: ({ getValue }) => {
      const value = getValue<number | undefined>()
      return <TextCell value={value == null ? '' : String(value)} />
    },
  },
  {
    accessorKey: 'changedBy',
    header: 'שונה ע"י',
    cell: ({ getValue }) => <TextCell value={getValue<string>()} />,
  },
  {
    accessorKey: 'field',
    header: 'שדה',
    cell: ({ getValue }) => <TextCell value={getValue<string>()} />,
  },
  {
    id: 'valueChange',
    header: 'שינוי ערך',
    enableSorting: false,
    cell: ({ row }) => {
      // A delete carries only the old value (red); an insert only the new value
      // (green); an update shows the full old → new transition.
      const category = classifyChangeType(row.original.typeOfChange)
      if (category === 'delete') {
        return <TextCell value={row.original.oldValue} className={styles.oldValue} />
      }
      if (category === 'add') {
        return <TextCell value={row.original.newValue} className={styles.newValue} />
      }
      return <ValueChange oldValue={row.original.oldValue} newValue={row.original.newValue} />
    },
  },
]

export interface FoodLogsTableProps {
  data: FoodLog[] | undefined
  isLoading: boolean
  isError: boolean
  /** Whether a search has been submitted (mandatory fields filled). */
  hasSearched: boolean
  onRetry: () => void
  /** Rendered in the toolbar, between the search box and the Excel export. */
  filtersSlot?: ReactNode
}

export function FoodLogsTable({
  data,
  isLoading,
  isError,
  hasSearched,
  onRetry,
  filtersSlot,
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
          <div style={{ display: 'flex', gap: '1rem' }}>
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
            {filtersSlot}
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
