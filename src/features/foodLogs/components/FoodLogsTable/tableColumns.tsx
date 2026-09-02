'use no memo'

import type { FoodLog } from '@/features/foodLogs/types/foodLog'
import { changeTypeLabel, classifyChangeType } from '@/features/foodLogs/utils/changeType'
import { formatDateRange, formatDateShort, formatTimeShort, toSapDate } from '@/utils/date'
import type { ColumnDef, SortingFn } from '@tanstack/react-table'
import styles from './FoodLogsTable.module.scss'
import { ChangeTypeBadge, ConsumptionDateCell, TextCell, ValueChange } from './TableCells'

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
  (a.original.consumptionDateFrom?.getTime() ?? 0) -
  (b.original.consumptionDateFrom?.getTime() ?? 0)

const sortByFirstDayInPeriod: SortingFn<FoodLog> = (a, b) =>
  (a.original.firstDayInPeriod?.getTime() ?? 0) - (b.original.firstDayInPeriod?.getTime() ?? 0)

const sortByDayInPeriod: SortingFn<FoodLog> = (a, b) =>
  (a.original.dayInPeriod ?? 0) - (b.original.dayInPeriod ?? 0)

// Column sizes are relative ratios, not pixels: the table scales them to fit its container.
export const columns: ColumnDef<FoodLog>[] = [
  {
    id: 'changeDate',
    accessorFn: (row) => dateSearchText(row.changeDate),
    header: 'תאריך שינוי',
    size: 146,
    sortingFn: sortByChangeDate,
    cell: ({ row }) => formatDateShort(row.original.changeDate),
    meta: { exportValue: (row) => formatDateShort(row.changeDate) },
  },
  {
    id: 'changeTime',
    accessorFn: (row) => formatTimeShort(row.changeDate),
    header: 'שעת שינוי',
    size: 112,
    sortingFn: sortByChangeTime,
    cell: ({ getValue }) => getValue<string>(),
    meta: { exportValue: (row) => formatTimeShort(row.changeDate) },
  },
  {
    id: 'typeOfChange',
    accessorFn: (row) => changeTypeLabel(row.typeOfChange),
    header: 'סוג שינוי',
    size: 106,
    cell: ({ row }) => <ChangeTypeBadge code={row.original.typeOfChange} />,
    meta: { exportValue: (row) => changeTypeLabel(row.typeOfChange) },
  },
  {
    accessorKey: 'material',
    header: 'חומר',
    size: 109,
    cell: ({ getValue }) => <TextCell value={getValue<string>()} />,
    meta: { exportValue: (row) => row.material },
  },
  {
    accessorKey: 'materialDescription',
    header: 'תיאור חומר',
    size: 149,
    cell: ({ getValue }) => <TextCell value={getValue<string>()} />,
    meta: { exportValue: (row) => row.materialDescription },
  },
  {
    accessorKey: 'quantity',
    header: 'כמות',
    size: 80,
    cell: ({ getValue }) => <TextCell value={String(getValue<number>())} />,
    meta: { exportValue: (row) => row.quantity },
  },
  {
    id: 'consumptionDate',
    accessorFn: (row) =>
      `${dateSearchText(row.consumptionDateFrom)} ${dateSearchText(row.consumptionDateTo)}`.trim(),
    header: 'תאריך צריכה',
    size: 159,
    sortingFn: sortByConsumptionDate,
    cell: ({ row }) => (
      <ConsumptionDateCell
        from={row.original.consumptionDateFrom}
        to={row.original.consumptionDateTo}
      />
    ),
    meta: {
      exportValue: (row) => formatDateRange(row.consumptionDateFrom, row.consumptionDateTo),
    },
  },
  {
    id: 'firstDayInPeriod',
    accessorFn: (row) => dateSearchText(row.firstDayInPeriod),
    header: 'יום ראשון בתקופה',
    size: 168,
    sortingFn: sortByFirstDayInPeriod,
    cell: ({ row }) => formatDateShort(row.original.firstDayInPeriod),
    meta: { exportValue: (row) => formatDateShort(row.firstDayInPeriod) },
  },
  {
    id: 'dayInPeriod',
    accessorFn: (row) => (row.dayInPeriod == null ? '' : String(row.dayInPeriod)),
    header: 'יום בתקופה',
    size: 122,
    sortingFn: sortByDayInPeriod,
    cell: ({ getValue }) => <TextCell value={getValue<string>()} />,
    meta: { exportValue: (row) => row.dayInPeriod ?? '' },
  },
  {
    accessorKey: 'changedBy',
    header: 'שונה ע"י',
    size: 110,
    cell: ({ getValue }) => <TextCell value={getValue<string>()} />,
    meta: { exportValue: (row) => row.changedBy },
  },
  {
    accessorKey: 'field',
    header: 'שדה',
    size: 90,
    cell: ({ getValue }) => <TextCell value={getValue<string>()} />,
    meta: { exportValue: (row) => row.field },
  },
  {
    id: 'valueChange',
    accessorFn: (row) => `${row.oldValue} ${row.newValue}`,
    header: 'שינוי ערך',
    size: 138,
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
    meta: {
      exportColumns: [
        { header: 'ערך ישן', value: (row) => row.oldValue },
        { header: 'ערך חדש', value: (row) => row.newValue },
      ],
    },
  },
]
