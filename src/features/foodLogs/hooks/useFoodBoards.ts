import { fetchFoodBoards } from '@/features/foodLogs/services/foodBoardsApi'
import { useQuery } from '@tanstack/react-query'

export const foodBoardsKeys = {
  all: () => ['foodBoards'] as const,
}

export function useFoodBoards() {
  return useQuery({
    queryKey: foodBoardsKeys.all(),
    queryFn: fetchFoodBoards,
    staleTime: Infinity,
  })
}
