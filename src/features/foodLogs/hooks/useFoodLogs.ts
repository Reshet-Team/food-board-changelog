import { searchFoodLogs } from '@/features/foodLogs/services/foodLogsApi'
import type { FoodLogsFilter } from '@/features/foodLogs/types/foodLog'
import { useQuery } from '@tanstack/react-query'

export const foodLogsKeys = {
  all: () => ['foodLogs'] as const,
  search: (filter: FoodLogsFilter) => [...foodLogsKeys.all(), filter] as const,
}

export function useFoodLogs(filter: FoodLogsFilter | null) {
  return useQuery({
    queryKey: foodLogsKeys.search(filter!),
    queryFn: () => searchFoodLogs(filter!),
    enabled: filter !== null,
    staleTime: 5 * 60 * 1000,
    retry: 1,

    meta: {
      errorToast: {
        title: 'שגיאה בטעינת הנתונים',
        description: 'לא ניתן לטעון את רשומות השינויים. נסה שוב.',
      },
    },
  })
}
