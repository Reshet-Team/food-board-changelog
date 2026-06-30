import type { AlternativeOption } from '@/features/foodLogs/types/foodLog'

// ─── Daily alternatives ───────────────────────────────────────────────────────
// Alternatives whose type value is "daily" require a consumption date. There
// are ~100 alternatives but only a handful of types, so the daily/monthly
// distinction is driven by the type value, not the alternative number.
const DAILY_TYPE_VALUES = new Set([4, 6])

export function isDailyAlternative(
  alternativeValue: string,
  options: AlternativeOption[],
): boolean {
  const selected = options.find((option) => option.value === alternativeValue)
  return selected ? DAILY_TYPE_VALUES.has(Number(selected.typeValue)) : false
}

// ─── Change-date range rule ───────────────────────────────────────────────────
// The change-date range can't span more than 6 months from its start. Returns
// an error message when the range is too wide, or null when it's valid (or when
// either end is missing).
export function validateDateRange(from?: Date | null, to?: Date | null): string | null {
  if (!from || !to) return null
  const maxDate = new Date(from)
  maxDate.setMonth(maxDate.getMonth() + 6)
  return to > maxDate ? 'טווח התאריכים לא יכול לחרוג מ-6 חודשים' : null
}
