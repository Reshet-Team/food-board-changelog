import type { FoodLog, RawFoodLog } from '@/features/foodLogs/types/foodLog'
import { fromSapDate, fromSapDateTime } from '@/utils/date'

export function toFoodLog(raw: RawFoodLog): FoodLog {
  const { changeDate, changeTime, consumptionDate, ...rest } = raw
  return {
    ...rest,
    changeDate: fromSapDateTime(changeDate, changeTime),
    ...(consumptionDate ? { consumptionDate: fromSapDate(consumptionDate) } : {}),
  }
}
