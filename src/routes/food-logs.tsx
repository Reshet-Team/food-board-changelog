import { FoodLogsPage } from '@/features/foodLogs/components/FoodLogsPage/FoodLogsPage'
import { foodLogsSearchSchema } from '@/features/foodLogs/types/foodLog'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/food-logs')({
  validateSearch: foodLogsSearchSchema,
  component: FoodLogsPage,
})
