import { fetchMockAlternatives } from '@/features/foodLogs/services/mockData'
import type { AlternativeOption } from '@/features/foodLogs/types/foodLog'
import { USE_MOCK_DATA } from '@/lib/api.utilities'
import { axiosInstance } from '@/lib/axiosClient'

export async function fetchAlternatives(): Promise<AlternativeOption[]> {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (USE_MOCK_DATA) return fetchMockAlternatives()

  const { data } = await axiosInstance.get<AlternativeOption[]>('/alternative')
  // An unreachable backend resolves with the SPA's HTML instead of JSON.
  if (!Array.isArray(data)) throw new Error('תגובה לא צפויה מהשרת עבור רשימת החלופות')
  return data
}
