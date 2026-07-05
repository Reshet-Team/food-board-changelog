import type { FoodLog, RawFoodLog } from '@/features/foodLogs/types/foodLog'
import { fromSapDate, fromSapDateTime } from '@/utils/date'

export function toFoodLog(raw: RawFoodLog): FoodLog {
  const { changeDate, changeTime, consumptionDateFrom, consumptionDateTo, firstDay, ...rest } = raw
  return {
    ...rest,
    changeDate: fromSapDateTime(changeDate, changeTime),
    ...(consumptionDateFrom ? { consumptionDateFrom: fromSapDate(consumptionDateFrom) } : {}),
    ...(consumptionDateTo ? { consumptionDateTo: fromSapDate(consumptionDateTo) } : {}),
    ...(firstDay ? { firstDayInPeriod: fromSapDate(firstDay) } : {}),
  }
}
