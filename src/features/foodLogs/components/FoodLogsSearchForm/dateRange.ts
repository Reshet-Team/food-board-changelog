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
