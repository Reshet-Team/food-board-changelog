import { Button } from '@/components/ui/Button/Button'
import { FoodLogsSearchForm } from '@/features/foodLogs/components/FoodLogsSearchForm/FoodLogsSearchForm'
import { FoodLogsTable } from '@/features/foodLogs/components/FoodLogsTable/FoodLogsTable'
import { useFoodLogs } from '@/features/foodLogs/hooks/useFoodLogs'
import type { FoodLogsFilter } from '@/features/foodLogs/types/foodLog'
import {
  ALL_CHANGE_TYPES,
  matchesChangeTypes,
  type ChangeType,
} from '@/features/foodLogs/utils/changeType'
import { useSearch } from '@tanstack/react-router'
import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import styles from './FoodLogsPage.module.scss'

export function FoodLogsPage() {
  const search = useSearch({ from: '/food-logs' })
  const [filtersOpen, setFiltersOpen] = useState(true)
  // Local change-type filter, applied to the rows after they arrive from SAP.
  // Defaults to every category selected (shows everything).
  const [changeTypes, setChangeTypes] = useState<ChangeType[]>(ALL_CHANGE_TYPES)

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

  // Apply the local change-type filter before the table sees the data. When all
  // categories are selected the original list (including its loading/undefined
  // state) is passed through untouched.
  const displayedData =
    query.data && changeTypes.length < ALL_CHANGE_TYPES.length
      ? query.data.filter((row) => matchesChangeTypes(row.typeOfChange, changeTypes))
      : query.data

  // While the table has no rows to show, the filter panel stays open and the
  // toggle is locked — there's nothing to reveal by closing it, and the user
  // still needs the form to run a search.
  const hasData = rows.length > 0
  const filtersVisible = filtersOpen || !hasData

  const filtersButton = (
    <Button
      variant="secondary"
      size="sm"
      aria-pressed={filtersVisible}
      disabled={filtersVisible && !hasData}
      title={
        filtersVisible && !hasData ? 'לא ניתן לסגור את המסננים כל עוד אין תוצאות בטבלה' : undefined
      }
      onClick={() => setFiltersOpen((open) => !open)}
    >
      <SlidersHorizontal size="1rem" aria-hidden />
      מסננים
    </Button>
  )

  return (
    <div className={styles.page}>
      <header className={styles.appHeader}>
        <img className={styles.appLogo} src="/logo.png" alt="" aria-hidden />
        <h1 className={styles.appTitle}>יומן שינויים בלוחות מזון</h1>
      </header>

      <div className={styles.body}>
        <main className={styles.main}>
          <FoodLogsTable
            data={displayedData}
            isLoading={query.isLoading}
            isError={query.isError}
            hasSearched={filter !== null}
            onRetry={() => void query.refetch()}
            filtersSlot={filtersButton}
          />
        </main>

        {filtersVisible && (
          <aside className={styles.sidebar}>
            <FoodLogsSearchForm
              defaultValues={search}
              isLoading={query.isFetching}
              changeTypes={changeTypes}
              onChangeTypesChange={setChangeTypes}
            />
          </aside>
        )}
      </div>
    </div>
  )
}
