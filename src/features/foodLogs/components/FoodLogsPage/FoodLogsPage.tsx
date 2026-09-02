import { Button } from '@/components/ui/Button/Button'
import { FoodLogsSearchForm } from '@/features/foodLogs/components/FoodLogsSearchForm/FoodLogsSearchForm'
import { FoodLogsTable } from '@/features/foodLogs/components/FoodLogsTable/FoodLogsTable'
import { useFoodLogs } from '@/features/foodLogs/hooks/useFoodLogs'
import { foodLogsFilterAtom } from '@/features/foodLogs/store/filterAtom'
import type { FoodLogsFilter } from '@/features/foodLogs/types/foodLog'
import {
  ALL_CHANGE_TYPES,
  matchesChangeTypes,
  type ChangeType,
} from '@/features/foodLogs/utils/changeType'
import { getServerMessage } from '@/features/foodLogs/utils/getServerErrorMessage'
import { useAtomValue } from 'jotai'
import { SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import styles from './FoodLogsPage.module.scss'

export function FoodLogsPage() {
  const search = useAtomValue(foodLogsFilterAtom)
  const [filtersOpen, setFiltersOpen] = useState(true)

  const [changeTypes, setChangeTypes] = useState<ChangeType[]>(ALL_CHANGE_TYPES)

  const filter: FoodLogsFilter | null =
    search.foodBoard && search.alternative
      ? {
          foodBoard: search.foodBoard,
          alternative: search.alternative,
          dateFrom: search.dateFrom,
          dateTo: search.dateTo,
          ...(search.material?.length && { material: search.material }),
          ...(search.consumptionDateFrom && { consumptionDateFrom: search.consumptionDateFrom }),
          ...(search.consumptionDateTo && { consumptionDateTo: search.consumptionDateTo }),
          ...(search.changedBy?.length && { changedBy: search.changedBy }),
        }
      : null

  const { data, isLoading, isError, isFetching, error } = useFoodLogs(filter)
  const errorMessage = getServerMessage(error)

  const displayedData = useMemo(() => {
    if (!data || changeTypes.length >= ALL_CHANGE_TYPES.length) return data
    return data.filter((row) => matchesChangeTypes(row.typeOfChange, changeTypes))
  }, [data, changeTypes])

  const hasData = (displayedData?.length ?? 0) > 0
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
        <img className={styles.appLogo} src="./logo.png" alt="" aria-hidden />
        <h1 className={styles.appTitle}>יומן שינויים בלוחות מזון</h1>
      </header>

      <div className={styles.body}>
        <main className={styles.main}>
          <FoodLogsTable
            data={displayedData}
            isLoading={isLoading}
            isError={isError}
            errorMessage={errorMessage}
            hasSearched={filter !== null}
            filtersSlot={filtersButton}
          />
        </main>

        {filtersVisible ? (
          <aside className={styles.sidebar}>
            <FoodLogsSearchForm
              defaultValues={search}
              isLoading={isFetching}
              changeTypes={changeTypes}
              onChangeTypesChange={setChangeTypes}
            />
          </aside>
        ) : null}
      </div>
    </div>
  )
}
