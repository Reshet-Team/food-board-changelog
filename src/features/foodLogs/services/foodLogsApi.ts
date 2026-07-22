import type { FoodLog, FoodLogsFilter, RawFoodLog } from '@/features/foodLogs/types/foodLog'
import { toFoodLog } from '@/features/foodLogs/utils/parseFoodLog'
import { axiosInstance } from '@/lib/axiosClient'
import { toSapDate } from '@/utils/date'

export async function searchFoodLogs(filter: FoodLogsFilter): Promise<FoodLog[]> {
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

  const { data } = await axiosInstance.post<RawFoodLog[]>('/food-logs', body)
  return data.map(toFoodLog)
}
