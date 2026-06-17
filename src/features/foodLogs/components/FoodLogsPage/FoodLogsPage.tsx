import { FoodLogsSearchForm } from '@/features/foodLogs/components/FoodLogsSearchForm/FoodLogsSearchForm'
import { FoodLogsTable } from '@/features/foodLogs/components/FoodLogsTable/FoodLogsTable'
import styles from './FoodLogsPage.module.scss'

export function FoodLogsPage() {
  return (
    <div className={styles.foodLogsPage}>
      <FoodLogsSearchForm />
      <FoodLogsTable />
    </div>
  )
}
