import { fetchMockFoodBoards } from '@/features/foodLogs/services/mockData'
import type { FoodBoardOption } from '@/features/foodLogs/types/foodLog'
import { USE_MOCK_DATA } from '@/lib/api.utilities'
import { axiosInstance } from '@/lib/axiosClient'

export async function fetchFoodBoards(): Promise<FoodBoardOption[]> {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (USE_MOCK_DATA) return fetchMockFoodBoards()

  const { data } = await axiosInstance.get<FoodBoardOption[]>('/food-board')
  // An unreachable backend resolves with the SPA's HTML instead of JSON.
  if (!Array.isArray(data)) throw new Error('תגובה לא צפויה מהשרת עבור רשימת לוחות המזון')
  return data
}
