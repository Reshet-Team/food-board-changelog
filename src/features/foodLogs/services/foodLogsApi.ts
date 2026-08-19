import { fetchMockFoodLogs } from '@/features/foodLogs/services/mockData'
import type { FoodLog, FoodLogsFilter, RawFoodLog } from '@/features/foodLogs/types/foodLog'
import { toFoodLog } from '@/features/foodLogs/utils/parseFoodLog'
import { USE_MOCK_DATA } from '@/lib/api.utilities'
import { axiosInstance } from '@/lib/axiosClient'
import { toSapDate } from '@/utils/date'

export async function searchFoodLogs(filter: FoodLogsFilter): Promise<FoodLog[]> {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (USE_MOCK_DATA) return (await fetchMockFoodLogs(filter)).map(toFoodLog)

  const { dateFrom, dateTo, consumptionDateFrom, consumptionDateTo, material, changedBy, ...rest } =
    filter

  const body: Record<string, unknown> = { ...rest }
  body.dateFrom = toSapDate(dateFrom)
  body.dateTo = toSapDate(dateTo)

  if (material?.length) body.material = material
  // SAP stores usernames uppercase ("S123456"), so a lowercase filter finds nothing.
  if (changedBy?.length) body.changedBy = changedBy.map((user) => user.toUpperCase())

  if (consumptionDateFrom) {
    body.consumptionDateFrom = toSapDate(consumptionDateFrom)
    if (consumptionDateTo) body.consumptionDateTo = toSapDate(consumptionDateTo)
  }

  const { data } = await axiosInstance.post<RawFoodLog[]>('/food-logs', body)
  // An unreachable backend resolves with the SPA's HTML instead of JSON.
  if (!Array.isArray(data)) throw new Error('תגובה לא צפויה מהשרת עבור רשימת השינויים')
  return data.map(toFoodLog)
}
