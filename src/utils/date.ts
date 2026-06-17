/** Format a date string to a human-readable locale string */
export function formatDate(date: Date, locale = 'he-IL'): string {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Converts any Date to SAP's DATUM wire format: YYYYMMDD (e.g. "20260617") */
export function toSapDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}
