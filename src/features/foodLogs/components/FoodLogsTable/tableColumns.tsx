'use no memo' // TanStack Table doesn't support the React Compiler yet

import { TooltipContent, TooltipRoot, TooltipTrigger } from '@/components/ui/Tooltip/Tooltip'
import type { FoodLog } from '@/features/foodLogs/types/foodLog'
import { changeTypeLabel, classifyChangeType } from '@/features/foodLogs/utils/changeType'
import { useResizeObserver } from '@/hooks/useResizeObserver'
import { formatDateShort, formatTimeShort } from '@/utils/date'
import type { ColumnDef, SortingFn } from '@tanstack/react-table'
import clsx from 'clsx'
import { ArrowLeft } from 'lucide-react'
import { useRef, useState } from 'react'
import styles from './FoodLogsTable.module.scss'

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

  // Re-measure on mount, on resize, and whenever the value (and therefore the
  // single-token check) changes. A multi-token value is allowed to wrap, so it
  // is never reported as clipped.
  useResizeObserver(ref, () => {
    const el = ref.current
    setIsClipped(!!el && isSingleToken && el.scrollWidth > el.clientWidth)
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
// All data columns are sortable (TanStack Table's default). Date columns hold
// real `Date` objects and format on display; `sortByDate` compares them by time
// and treats a missing date as the earliest value so sorting never crashes.
const sortByDate: SortingFn<FoodLog> = (rowA, rowB, columnId) => {
  const a = rowA.getValue<Date | undefined>(columnId)
  const b = rowB.getValue<Date | undefined>(columnId)
  return (a ? a.getTime() : 0) - (b ? b.getTime() : 0)
}

// The change-date and change-time columns share one underlying timestamp but
// behave like two independent fields: the date column sorts by calendar day
// (above), while the time column sorts by time-of-day only — so 09:00 always
// comes before 17:00 regardless of which day each change happened on.
const secondsOfDay = (date: Date | undefined): number =>
  date ? date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() : 0

const sortByTimeOfDay: SortingFn<FoodLog> = (rowA, rowB, columnId) =>
  secondsOfDay(rowA.getValue<Date | undefined>(columnId)) -
  secondsOfDay(rowB.getValue<Date | undefined>(columnId))

export const columns: ColumnDef<FoodLog>[] = [
  {
    accessorKey: 'changeDate',
    header: 'תאריך שינוי',
    sortingFn: sortByDate,
    cell: ({ getValue }) => formatDateShort(getValue<Date>()),
  },
  {
    id: 'changeTime',
    accessorFn: (row) => row.changeDate,
    header: 'שעת שינוי',
    sortingFn: sortByTimeOfDay,
    cell: ({ getValue }) => formatTimeShort(getValue<Date>()),
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
    sortingFn: sortByDate,
    cell: ({ getValue }) => formatDateShort(getValue<Date | undefined>()),
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
