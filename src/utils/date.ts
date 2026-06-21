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

/** Formats a SAP DATUM string (YYYYMMDD) for display: "20260616" → "16.06.2026" */
export function formatSapDate(value: string): string {
  if (!/^\d{8}$/.test(value)) return value
  const year = value.slice(0, 4)
  const month = value.slice(4, 6)
  const day = value.slice(6, 8)
  return `${day}.${month}.${year}`
}

/** Formats a SAP UZEIT string (HHMMSS) for display: "143000" → "14:30:00" */
export function formatSapTime(value: string): string {
  if (!/^\d{6}$/.test(value)) return value
  const hours = value.slice(0, 2)
  const minutes = value.slice(2, 4)
  const seconds = value.slice(4, 6)
  return `${hours}:${minutes}:${seconds}`
}
