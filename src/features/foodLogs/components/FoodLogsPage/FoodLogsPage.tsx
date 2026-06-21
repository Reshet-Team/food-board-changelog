import { FoodLogsSearchForm } from '@/features/foodLogs/components/FoodLogsSearchForm/FoodLogsSearchForm'
import { FoodLogsTable } from '@/features/foodLogs/components/FoodLogsTable/FoodLogsTable'
import { useFoodLogs } from '@/features/foodLogs/hooks/useFoodLogs'
import type { FoodLogsFilter } from '@/features/foodLogs/types/foodLog'
import { useSearch } from '@tanstack/react-router'
import styles from './FoodLogsPage.module.scss'

export function FoodLogsPage() {
  const search = useSearch({ from: '/food-logs' })

  // Only pass a filter to the query when the mandatory fields are filled.
  // Before first submit (foodBoard/alternative are empty strings), filter is null
  // and the query stays idle.
  // With exactOptionalPropertyTypes, we must omit optional properties
  // rather than assigning them as `undefined`.
  const filter: FoodLogsFilter | null =
    search.foodBoard && search.alternative
      ? {
          foodBoard: search.foodBoard,
          alternative: search.alternative,
          dateFrom: search.dateFrom,
          dateTo: search.dateTo,
          ...(search.material !== undefined && { material: search.material }),
          ...(search.consumptionDate !== undefined && {
            consumptionDate: search.consumptionDate,
          }),
          ...(search.changeTime !== undefined && { changeTime: search.changeTime }),
          ...(search.changedBy !== undefined && { changedBy: search.changedBy }),
        }
      : null

  const query = useFoodLogs(filter)

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>שינויים בלוחות מזון</h1>
      <div className={styles.formCard}>
        <FoodLogsSearchForm defaultValues={search} isLoading={query.isFetching} />
      </div>
      <FoodLogsTable
        data={query.data}
        isLoading={query.isLoading}
        isError={query.isError}
        hasSearched={filter !== null}
        onRetry={() => void query.refetch()}
      />
    </div>
  )
}
