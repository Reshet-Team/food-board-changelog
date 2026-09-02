'use no memo'

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
import { FileSearch } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import styles from './FoodLogsTable.module.scss'

const LOADING_ROWS = 12

// The server sends one comma-separated string: a headline, then what to try next.
function splitMessage(message: string): [string, string | undefined] {
  const [title, ...rest] = message.split(',')
  const description = rest.join(',').trim()
  return [title?.trim() || message, description || undefined]
}

export interface FoodLogsTableProps {
  data: FoodLog[] | undefined
  isLoading: boolean
  isError: boolean
  errorMessage: string

  hasSearched: boolean

  filtersSlot?: ReactNode
}

export function FoodLogsTable({
  data,
  isLoading,
  isError,
  errorMessage,
  hasSearched,
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
    const [title, description] = splitMessage(errorMessage)

    return (
      <div className={styles.stateCard}>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileSearch aria-hidden />
            </EmptyMedia>
            <EmptyTitle>{title}</EmptyTitle>
            {description ? <EmptyDescription>{description}</EmptyDescription> : null}
          </EmptyHeader>
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
