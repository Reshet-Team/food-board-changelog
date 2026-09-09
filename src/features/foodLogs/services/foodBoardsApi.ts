import { axiosInstance } from '@/lib/axiosClient'

export async function fetchFoodBoards(): Promise<string[]> {
  const { data } = await axiosInstance.get<string[]>('/food-board')
  // An unreachable backend resolves with the SPA's HTML instead of JSON.
  if (!Array.isArray(data)) throw new Error('תגובה לא צפויה מהשרת עבור רשימת לוחות המזון')
  return data
}
