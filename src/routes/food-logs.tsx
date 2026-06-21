import { FoodLogsPage } from '@/features/foodLogs/components/FoodLogsPage/FoodLogsPage'
import { foodLogsSearchSchema } from '@/features/foodLogs/types/foodLog'
import { createFileRoute, redirect } from '@tanstack/react-router'

// Tracks whether we've already evaluated the very first route load for this
// page session. We only want to reset on a hard browser refresh, not on every
// in-app navigation, so this guard ensures the check runs a single time.
let handledInitialLoad = false

export const Route = createFileRoute('/food-logs')({
  validateSearch: foodLogsSearchSchema,
  beforeLoad: ({ search }) => {
    if (handledInitialLoad) return
    handledInitialLoad = true

    // On a hard browser refresh, clear any search params so the screen returns
    // to its default (empty) state. Runs before the component renders, so the
    // form initializes clean. Other navigation types keep their params.
    const navEntry = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined
    if (navEntry?.type === 'reload' && (search.foodBoard || search.alternative)) {
      throw redirect({ to: '/food-logs', search: foodLogsSearchSchema.parse({}) })
    }
  },
  component: FoodLogsPage,
})
