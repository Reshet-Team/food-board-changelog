import { fetchAlternatives } from '@/features/foodLogs/services/alternativesApi'
import { useQuery } from '@tanstack/react-query'

export const alternativesKeys = {
  all: () => ['alternatives'] as const,
}

export function useAlternatives() {
  return useQuery({
    queryKey: alternativesKeys.all(),
    queryFn: fetchAlternatives,
    staleTime: Infinity,
  })
}
