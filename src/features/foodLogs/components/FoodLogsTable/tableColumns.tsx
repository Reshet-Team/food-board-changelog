'use no memo' // TanStack Table doesn't support the React Compiler yet

import type { FoodLog } from '@/features/foodLogs/types/foodLog'
import { changeTypeLabel, classifyChangeType } from '@/features/foodLogs/utils/changeType'
import { formatDateShort, formatTimeShort, toSapDate } from '@/utils/date'
import type { ColumnDef, SortingFn } from '@tanstack/react-table'
import styles from './FoodLogsTable.module.scss'
import { ChangeTypeBadge, TextCell, ValueChange } from './TableCells'

// ─── Searchable text ─────────────────────────────────────────────────────────
// Each column's `accessorFn` returns the string the built-in `includesString`
// global filter matches against — so search works on exactly what the user
// sees. Date columns expose both the displayed format ("16.06.2026") and the
// SAP format ("20260616") so either can be searched. Display still comes from
// the column's `cell`, and ordering from its `sortingFn`.
function dateSearchText(date: Date | undefined): string {
  if (!date) return ''
  return `${formatDateShort(date)} ${toSapDate(date)}`
}

// ─── Sorting ─────────────────────────────────────────────────────────────────
// Sort functions read the raw `Date`/number off `row.original`, independent of
// the (string) accessor value used for filtering and display.
const sortByChangeDate: SortingFn<FoodLog> = (a, b) =>
  a.original.changeDate.getTime() - b.original.changeDate.getTime()

// The change-date and change-time columns share one timestamp but behave like
// two independent fields: the date column sorts by calendar day (above) while
// the time column sorts by time-of-day only — so 09:00 always comes before
// 17:00 regardless of which day each change happened on.
const secondsOfDay = (date: Date): number =>
  date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()

const sortByChangeTime: SortingFn<FoodLog> = (a, b) =>
  secondsOfDay(a.original.changeDate) - secondsOfDay(b.original.changeDate)

const sortByConsumptionDate: SortingFn<FoodLog> = (a, b) =>
  (a.original.consumptionDate?.getTime() ?? 0) - (b.original.consumptionDate?.getTime() ?? 0)

const sortByDayInPeriod: SortingFn<FoodLog> = (a, b) =>
  (a.original.dayInPeriod ?? 0) - (b.original.dayInPeriod ?? 0)

// ─── Column definitions ──────────────────────────────────────────────────────
// All data columns are sortable (TanStack Table's default) and globally
// filterable via the built-in `includesString` filter (configured on the table).
export const columns: ColumnDef<FoodLog>[] = [
  {
    id: 'changeDate',
    accessorFn: (row) => dateSearchText(row.changeDate),
    header: 'תאריך שינוי',
    sortingFn: sortByChangeDate,
    cell: ({ row }) => formatDateShort(row.original.changeDate),
  },
  {
    id: 'changeTime',
    accessorFn: (row) => formatTimeShort(row.changeDate),
    header: 'שעת שינוי',
    sortingFn: sortByChangeTime,
    cell: ({ getValue }) => getValue<string>(),
  },
  {
    id: 'typeOfChange',
    accessorFn: (row) => changeTypeLabel(row.typeOfChange),
    header: 'סוג שינוי',
    cell: ({ row }) => <ChangeTypeBadge code={row.original.typeOfChange} />,
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
    id: 'consumptionDate',
    accessorFn: (row) => dateSearchText(row.consumptionDate),
    header: 'תאריך צריכה',
    sortingFn: sortByConsumptionDate,
    cell: ({ row }) => formatDateShort(row.original.consumptionDate),
  },
  {
    id: 'dayInPeriod',
    accessorFn: (row) => (row.dayInPeriod == null ? '' : String(row.dayInPeriod)),
    header: 'יום בתקופה',
    sortingFn: sortByDayInPeriod,
    cell: ({ getValue }) => <TextCell value={getValue<string>()} />,
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
    accessorFn: (row) => `${row.oldValue} ${row.newValue}`,
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
