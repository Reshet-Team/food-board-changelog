import type { FoodLog, RawFoodLog } from '@/features/foodLogs/types/foodLog'
import { fromSapDate, fromSapDateTime } from '@/utils/date'

const NUMERIC_VALUE = /^[+-]?(?:\d+\.?\d*|\.\d+)$/

/** SAP pads numeric quantities to a fixed scale ("66.000"), so drop the trailing zeros. */
function trimNumericValue(value: string): string {
  const trimmed = value.trim()
  if (!NUMERIC_VALUE.test(trimmed)) return value

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? String(parsed) : value
}

export function toFoodLog(raw: RawFoodLog): FoodLog {
  const { changeDate, changeTime, consumptionDateFrom, consumptionDateTo, firstDay, ...rest } = raw
  return {
    ...rest,
    oldValue: trimNumericValue(raw.oldValue),
    newValue: trimNumericValue(raw.newValue),
    changeDate: fromSapDateTime(changeDate, changeTime),
    ...(consumptionDateFrom ? { consumptionDateFrom: fromSapDate(consumptionDateFrom) } : {}),
    ...(consumptionDateTo ? { consumptionDateTo: fromSapDate(consumptionDateTo) } : {}),
    ...(firstDay ? { firstDayInPeriod: fromSapDate(firstDay) } : {}),
  }
}
