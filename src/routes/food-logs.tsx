import { FoodLogsPage } from '@/features/foodLogs/components/FoodLogsPage/FoodLogsPage'
import { createFileRoute } from '@tanstack/react-router'

// The active search filter now lives in a Jotai atom (see
// features/foodLogs/store/filterAtom), not in the URL. The atom is in-memory,
// so a hard browser refresh naturally returns the screen to its default state.
export const Route = createFileRoute('/food-logs')({
  component: FoodLogsPage,
})
