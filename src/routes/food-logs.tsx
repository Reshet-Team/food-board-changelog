import { FoodLogsPage } from '@/features/foodLogs/components/FoodLogsPage/FoodLogsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/food-logs')({
  component: FoodLogsPage,
})
