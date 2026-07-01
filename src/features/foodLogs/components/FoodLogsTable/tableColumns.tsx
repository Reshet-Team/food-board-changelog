'use no memo'

import type { FoodLog } from '@/features/foodLogs/types/foodLog'
import { changeTypeLabel, classifyChangeType } from '@/features/foodLogs/utils/changeType'
import { formatDateShort, formatTimeShort, toSapDate } from '@/utils/date'
import type { ColumnDef, SortingFn } from '@tanstack/react-table'
import styles from './FoodLogsTable.module.scss'
import { ChangeTypeBadge, TextCell, ValueChange } from './TableCells'

function dateSearchText(date: Date | undefined): string {
  if (!date) return ''
  return `${formatDateShort(date)} ${toSapDate(date)}`
}

const sortByChangeDate: SortingFn<FoodLog> = (a, b) =>
  a.original.changeDate.getTime() - b.original.changeDate.getTime()

const secondsOfDay = (date: Date): number =>
  date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()

const sortByChangeTime: SortingFn<FoodLog> = (a, b) =>
  secondsOfDay(a.original.changeDate) - secondsOfDay(b.original.changeDate)

const sortByConsumptionDate: SortingFn<FoodLog> = (a, b) =>
  (a.original.consumptionDate?.getTime() ?? 0) - (b.original.consumptionDate?.getTime() ?? 0)

const sortByDayInPeriod: SortingFn<FoodLog> = (a, b) =>
  (a.original.dayInPeriod ?? 0) - (b.original.dayInPeriod ?? 0)

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
