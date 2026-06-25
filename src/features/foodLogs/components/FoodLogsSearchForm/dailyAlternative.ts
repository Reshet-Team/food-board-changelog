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
