'use no memo'

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
import { FoodLogsTableToolbar } from '@/features/foodLogs/components/FoodLogsTable/FoodLogsTableToolbar'
import { columns } from '@/features/foodLogs/components/FoodLogsTable/tableColumns'
import type { FoodLog } from '@/features/foodLogs/types/foodLog'
import { FileSearch, RotateCw, TriangleAlert } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import styles from './FoodLogsTable.module.scss'

const LOADING_ROWS = 12

export interface FoodLogsTableProps {
  data: FoodLog[] | undefined
  isLoading: boolean
  isError: boolean

  hasSearched: boolean
  onRetry: () => void

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
  const rows = useMemo(() => data ?? [], [data])

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

  return (
    <div className={styles.tableArea}>
      <DataTableRoot
        columns={columns}
        data={rows}
        isLoading={isLoading}
        loadingRowsCount={LOADING_ROWS}
        className={styles.tableWrapper!}
        globalFilterFn="includesString"
      >
        <FoodLogsTableToolbar filtersSlot={filtersSlot} />
        <DataTableContent>
          <DataTableHeader />
          <DataTableBody emptyMessage="לא נמצאו תוצאות התואמות את החיפוש" />
        </DataTableContent>
      </DataTableRoot>
    </div>
  )
}
