import type { FoodLog, FoodLogsFilter } from '@/features/foodLogs/types/foodLog'
import { toSapDate } from '@/utils/date'
import { filterMockFoodLogs } from './mockFoodLogs'

export async function searchFoodLogs(filter: FoodLogsFilter): Promise<FoodLog[]> {
  // Mock mode (VITE_USE_MOCK_DATA=true) or no SAP backend configured → serve
  // mock data so the screen can be tested without a live SAP server.
  if (import.meta.env.VITE_USE_MOCK_DATA === 'true' || !import.meta.env.VITE_SAP_API_BASE_URL) {
    await new Promise((resolve) => setTimeout(resolve, 600)) // simulate latency
    return filterMockFoodLogs(filter)
  }

  // Runs when the user presses search: GET <base URL>/food-logs.
  const baseUrl = import.meta.env.VITE_SAP_API_BASE_URL.replace(/\/+$/, '')
  const url = new URL(`${baseUrl}/food-logs`)

  // Scalar string fields appended as-is; Date fields converted to SAP YYYYMMDD
  // format; array fields (material, changedBy) sent to SAP as a single
  // comma-separated value.
  const { dateFrom, dateTo, consumptionDateFrom, consumptionDateTo, material, changedBy, ...rest } =
    filter
  Object.entries(rest).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value)
  })
  if (material?.length) url.searchParams.set('material', material.join(','))
  if (changedBy?.length) url.searchParams.set('changedBy', changedBy.join(','))
  url.searchParams.set('dateFrom', toSapDate(dateFrom))
  if (dateTo) url.searchParams.set('dateTo', toSapDate(dateTo))
  if (consumptionDateFrom)
    url.searchParams.set('consumptionDateFrom', toSapDate(consumptionDateFrom))
  if (consumptionDateTo) url.searchParams.set('consumptionDateTo', toSapDate(consumptionDateTo))

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
