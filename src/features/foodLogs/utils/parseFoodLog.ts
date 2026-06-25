import type { FoodLog, RawFoodLog } from '@/features/foodLogs/types/foodLog'
import { fromSapDate, fromSapDateTime } from '@/utils/date'

/**
 * Converts a raw SAP food-log record (with YYYYMMDD/HHMMSS strings) into the
 * domain `FoodLog`, parsing the date fields into real `Date` objects. The change
 * date and time are merged into a single `changeDate` timestamp. Called at the
 * API boundary so the rest of the app works with dates, not wire strings.
 */
export function toFoodLog(raw: RawFoodLog): FoodLog {
  const { changeDate, changeTime, consumptionDate, ...rest } = raw
  return {
    ...rest,
    changeDate: fromSapDateTime(changeDate, changeTime),
    ...(consumptionDate ? { consumptionDate: fromSapDate(consumptionDate) } : {}),
  }
}
