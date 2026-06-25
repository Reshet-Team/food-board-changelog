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
import { exportExcel } from '@/features/foodLogs/components/FoodLogsTable/exportExcel'
import { columns } from '@/features/foodLogs/components/FoodLogsTable/tableColumns'
import {
  globalFilterFn,
  matchesQuery,
} from '@/features/foodLogs/components/FoodLogsTable/tableSearch'
import type { FoodLog } from '@/features/foodLogs/types/foodLog'
import { FileSearch, FileSpreadsheet, RotateCw, Search, TriangleAlert } from 'lucide-react'
import { useMemo, useState, type ChangeEvent, type ReactNode } from 'react'
import styles from './FoodLogsTable.module.scss'

// Number of skeleton rows to show while a fetch is in flight.
const LOADING_ROWS = 12

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
