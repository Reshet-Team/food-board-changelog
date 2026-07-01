import type { AlternativeOption } from '@/features/foodLogs/types/foodLog'

const DAILY_TYPE_VALUES = new Set([4, 6])

export function isDailyAlternative(
  alternativeValue: string,
  options: AlternativeOption[],
): boolean {
  const selected = options.find((option) => option.value === alternativeValue)
  return selected ? DAILY_TYPE_VALUES.has(Number(selected.typeValue)) : false
}

export function validateDateRange(from?: Date | null, to?: Date | null): string | null {
  if (!from || !to) return null
  const maxDate = new Date(from)
  maxDate.setMonth(maxDate.getMonth() + 6)
  return to > maxDate ? 'טווח התאריכים לא יכול לחרוג מ-6 חודשים' : null
}
