import { fetchAlternatives } from '@/features/foodLogs/services/alternativesApi'
import { useQuery } from '@tanstack/react-query'

export const alternativesKeys = {
  all: () => ['alternatives'] as const,
}

// Loads the global list of alternative options. The list rarely changes, so it
// is cached indefinitely for the session.
export function useAlternatives() {
  return useQuery({
    queryKey: alternativesKeys.all(),
    queryFn: fetchAlternatives,
    staleTime: Infinity,
  })
}
