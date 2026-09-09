import type { FoodLog, FoodLogsFilter, RawFoodLog } from '@/features/foodLogs/types/foodLog'
import { ServerMessageError } from '@/features/foodLogs/utils/getServerErrorMessage'
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
  // SAP stores usernames uppercase ("S123456"), so a lowercase filter finds nothing.
  if (changedBy?.length) body.changedBy = changedBy.map((user) => user.toUpperCase())

  if (consumptionDateFrom) {
    body.consumptionDateFrom = toSapDate(consumptionDateFrom)
    if (consumptionDateTo) body.consumptionDateTo = toSapDate(consumptionDateTo)
  }

  const { data } = await axiosInstance.post<RawFoodLog[] | string>('/food-logs', body)
  // With no rows to send, the service answers 200 with a line of text explaining why.
  if (!Array.isArray(data)) throw new ServerMessageError(String(data))
  return data.map(toFoodLog)
}
