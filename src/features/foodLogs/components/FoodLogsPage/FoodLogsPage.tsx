import { FoodLogsSearchForm } from '@/features/foodLogs/components/FoodLogsSearchForm/FoodLogsSearchForm'
import { FoodLogsTable } from '@/features/foodLogs/components/FoodLogsTable/FoodLogsTable'
import { useFoodLogs } from '@/features/foodLogs/hooks/useFoodLogs'
import type { FoodLogsFilter } from '@/features/foodLogs/types/foodLog'
import { foodLogsSearchSchema } from '@/features/foodLogs/types/foodLog'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect } from 'react'
import styles from './FoodLogsPage.module.scss'

export function FoodLogsPage() {
  const search = useSearch({ from: '/food-logs' })
  const navigate = useNavigate()

  // On a hard browser refresh, reset the URL params back to defaults so the
  // form always starts clean. useEffect runs once on mount — no risk of looping.
  useEffect(() => {
    const navEntry = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined
    if (navEntry?.type === 'reload') {
      void navigate({ to: '/food-logs', search: foodLogsSearchSchema.parse({}), replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const { isLoading } = useFoodLogs(filter)

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>שינויים בלוחות מזון</h1>
      <div className={styles.formCard}>
        <FoodLogsSearchForm defaultValues={search} isLoading={isLoading} />
      </div>
      <FoodLogsTable />
    </div>
  )
}
