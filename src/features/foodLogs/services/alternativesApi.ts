import type { AlternativeOption } from '@/features/foodLogs/types/foodLog'
import { axiosInstance } from '@/lib/axiosClient'

export async function fetchAlternatives(): Promise<AlternativeOption[]> {
  const { data } = await axiosInstance.get<AlternativeOption[]>('/alternative')
  return data
}
