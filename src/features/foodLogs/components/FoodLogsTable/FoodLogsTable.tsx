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
import { FileSearch, RotateCw, TriangleAlert } from 'lucide-react'
import { useEffect } from 'react'
import styles from './FoodLogsTable.module.scss'

// ─── Column definitions ──────────────────────────────────────────────────────
// All columns are sortable (TanStack Table's default). Date/time columns store
// the raw SAP wire value (so sorting stays correct) and only format on display.
const columns: ColumnDef<FoodLog>[] = [
  { accessorKey: 'typeOfChange', header: 'סוג שינוי' },
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
    <DataTableRoot
      columns={columns}
      data={data ?? []}
      isLoading={isLoading}
      enableVirtualization
      loadingRowsCount={8}
      className={styles.tableWrapper!}
    >
      <DataTableContent>
        <DataTableHeader />
        <DataTableBody />
      </DataTableContent>
    </DataTableRoot>
  )
}
