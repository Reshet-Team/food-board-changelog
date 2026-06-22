import { Button } from '@/components/ui/Button/Button'
import { FoodLogsSearchForm } from '@/features/foodLogs/components/FoodLogsSearchForm/FoodLogsSearchForm'
import { FoodLogsTable } from '@/features/foodLogs/components/FoodLogsTable/FoodLogsTable'
import { useFoodLogs } from '@/features/foodLogs/hooks/useFoodLogs'
import type { FoodLogsFilter } from '@/features/foodLogs/types/foodLog'
import { useSearch } from '@tanstack/react-router'
import { Bell, CircleHelp, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import styles from './FoodLogsPage.module.scss'

export function FoodLogsPage() {
  const search = useSearch({ from: '/food-logs' })
  const [filtersOpen, setFiltersOpen] = useState(true)

  // Only pass a filter to the query when the mandatory fields are filled.
  // Before first submit (foodBoard/alternative are empty strings), filter is null
  // and the query stays idle.
  // With exactOptionalPropertyTypes, we must omit optional properties
  // rather than assigning them as `undefined`
  //
  const filter: FoodLogsFilter | null =
    search.foodBoard && search.alternative
      ? {
          foodBoard: search.foodBoard,
          alternative: search.alternative,
          dateFrom: search.dateFrom,
          dateTo: search.dateTo,
          ...(search.material?.length ? { material: search.material } : {}),
          ...(search.consumptionDateFrom !== undefined && {
            consumptionDateFrom: search.consumptionDateFrom,
          }),
          ...(search.consumptionDateTo !== undefined && {
            consumptionDateTo: search.consumptionDateTo,
          }),
          ...(search.changedBy?.length ? { changedBy: search.changedBy } : {}),
        }
      : null

  const query = useFoodLogs(filter)
  const rows = query.data ?? []

  // While the table has no rows to show, the filter panel stays open and the
  // toggle is locked — there's nothing to reveal by closing it, and the user
  // still needs the form to run a search.
  const hasData = rows.length > 0
  const filtersVisible = filtersOpen || !hasData

  return (
    <div className={styles.page}>
      <header className={styles.appHeader}>
        <div className={styles.appHeaderStart}>
          <h1 className={styles.appTitle}>יומן שינויי BOM</h1>
          <span className={styles.syncBadge}>
            <span className={styles.syncDot} aria-hidden />
            מסונכרן ל-SAP
          </span>
        </div>
        <div className={styles.appHeaderEnd}>
          <Button variant="secondary" size="sm">
            <CircleHelp size="1rem" aria-hidden />
            מדריך שימוש
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="התראות">
            <Bell size="1rem" aria-hidden />
          </Button>
        </div>
      </header>

      <div className={styles.toolbar}>
        <Button
          variant="secondary"
          size="sm"
          aria-pressed={filtersVisible}
          disabled={filtersVisible && !hasData}
          title={
            filtersVisible && !hasData
              ? 'לא ניתן לסגור את המסננים כל עוד אין תוצאות בטבלה'
              : undefined
          }
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <SlidersHorizontal size="1rem" aria-hidden />
          מסננים
        </Button>
      </div>

      <div className={styles.body}>
        <main className={styles.main}>
          <FoodLogsTable
            data={query.data}
            isLoading={query.isLoading}
            isError={query.isError}
            hasSearched={filter !== null}
            onRetry={() => void query.refetch()}
          />
        </main>

        {filtersVisible && (
          <aside className={styles.sidebar}>
            <FoodLogsSearchForm defaultValues={search} isLoading={query.isFetching} />
          </aside>
        )}
      </div>
    </div>
  )
}
