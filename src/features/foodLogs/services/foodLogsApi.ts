import type { FoodLog, FoodLogsFilter } from '@/features/foodLogs/types/foodLog'
import { toSapDate } from '@/utils/date'
import { MOCK_FOOD_LOGS } from './mockFoodLogs'

export async function searchFoodLogs(filter: FoodLogsFilter): Promise<FoodLog[]> {
  // Mock mode (VITE_USE_MOCK_DATA=true) or no SAP backend configured → serve
  // mock data so the screen can be tested without a live SAP server.
  if (import.meta.env.VITE_USE_MOCK_DATA === 'true' || !import.meta.env.VITE_SAP_API_BASE_URL) {
    await new Promise((resolve) => setTimeout(resolve, 600)) // simulate latency
    // Empty-state demo: searching food board "0" returns no rows.
    return filter.foodBoard === '0' ? [] : MOCK_FOOD_LOGS
  }

  const url = new URL('/api/food-logs', import.meta.env.VITE_SAP_API_BASE_URL)

  // String fields appended as-is; Date fields converted to SAP YYYYMMDD format here.
  const { dateFrom, dateTo, consumptionDate, ...stringFields } = filter
  Object.entries(stringFields).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value)
  })
  url.searchParams.set('dateFrom', toSapDate(dateFrom))
  if (dateTo) url.searchParams.set('dateTo', toSapDate(dateTo))
  if (consumptionDate) url.searchParams.set('consumptionDate', toSapDate(consumptionDate))

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
