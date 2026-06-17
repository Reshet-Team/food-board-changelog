import type { FoodLog, FoodLogsFilter } from '@/features/foodLogs/types/foodLog'

export async function searchFoodLogs(filter: FoodLogsFilter): Promise<FoodLog[]> {
  const url = new URL('/api/food-logs', import.meta.env.VITE_SAP_API_BASE_URL)

  Object.entries(filter).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, value)
  })

  // Basic Auth — credentials loaded from env vars, never hardcoded
  const credentials = btoa(
    `${import.meta.env.VITE_SAP_USERNAME}:${import.meta.env.VITE_SAP_PASSWORD}`,
  )

  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Basic ${credentials}` },
  })

  if (!response.ok) throw new Error(`SAP error: ${response.status}`)

  const raw: FoodLog[] = await response.json()
  return raw
}
