import type { FoodLog, FoodLogsFilter, RawFoodLog } from '@/features/foodLogs/types/foodLog'
import { toFoodLog } from '@/features/foodLogs/utils/parseFoodLog'
import { toSapDate } from '@/utils/date'

export async function searchFoodLogs(filter: FoodLogsFilter): Promise<FoodLog[]> {
  const baseUrl = import.meta.env.VITE_SAP_API_BASE_URL.replace(/\/+$/, '')
  const url = new URL(`${baseUrl}/food-logs`)

  const { dateFrom, dateTo, consumptionDateFrom, consumptionDateTo, material, changedBy, ...rest } =
    filter

  const body: Record<string, unknown> = { ...rest }
  body.dateFrom = toSapDate(dateFrom)
  body.dateTo = toSapDate(dateTo)

  if (material?.length) body.material = material
  if (changedBy?.length) body.changedBy = changedBy

  if (consumptionDateFrom) {
    body.consumptionDateFrom = toSapDate(consumptionDateFrom)
    if (consumptionDateTo) body.consumptionDateTo = toSapDate(consumptionDateTo)
  }

  const credentials = btoa(
    `${import.meta.env.VITE_SAP_USERNAME}:${import.meta.env.VITE_SAP_PASSWORD}`,
  )

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) throw new Error(`SAP error: ${response.status}`)

  const raw: RawFoodLog[] = await response.json()
  return raw.map(toFoodLog)
}
