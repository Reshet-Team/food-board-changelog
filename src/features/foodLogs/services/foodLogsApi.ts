import type { FoodLog, FoodLogsFilter, RawFoodLog } from '@/features/foodLogs/types/foodLog'
import { toFoodLog } from '@/features/foodLogs/utils/parseFoodLog'
import { toSapDate } from '@/utils/date'
import { filterMockFoodLogs } from './mockFoodLogs'

export async function searchFoodLogs(filter: FoodLogsFilter): Promise<FoodLog[]> {
  if (import.meta.env.VITE_USE_MOCK_DATA === 'true' || !import.meta.env.VITE_SAP_API_BASE_URL) {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return filterMockFoodLogs(filter)
  }

  const baseUrl = import.meta.env.VITE_SAP_API_BASE_URL.replace(/\/+$/, '')
  const url = new URL(`${baseUrl}/food-logs`)

  const { dateFrom, dateTo, consumptionDateFrom, consumptionDateTo, material, changedBy, ...rest } =
    filter
  Object.entries(rest).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value)
  })
  if (material?.length) url.searchParams.set('material', material.join(','))
  if (changedBy?.length) url.searchParams.set('changedBy', changedBy.join(','))
  url.searchParams.set('dateFrom', toSapDate(dateFrom))
  url.searchParams.set('dateTo', toSapDate(dateTo))
  if (consumptionDateFrom)
    url.searchParams.set('consumptionDateFrom', toSapDate(consumptionDateFrom))
  if (consumptionDateTo) url.searchParams.set('consumptionDateTo', toSapDate(consumptionDateTo))

  const credentials = btoa(
    `${import.meta.env.VITE_SAP_USERNAME}:${import.meta.env.VITE_SAP_PASSWORD}`,
  )

  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Basic ${credentials}` },
  })

  if (!response.ok) throw new Error(`SAP error: ${response.status}`)

  const raw: RawFoodLog[] = await response.json()
  return raw.map(toFoodLog)
}
