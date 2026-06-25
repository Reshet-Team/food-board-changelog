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
export function formatSapDate(value: string | undefined): string {
  if (value == null) return ''
  if (!/^\d{8}$/.test(value)) return value
  const year = value.slice(0, 4)
  const month = value.slice(4, 6)
  const day = value.slice(6, 8)
  return `${day}.${month}.${year}`
}

/** Parses a SAP DATUM string (YYYYMMDD) into a local Date: "20260616" → Date(2026-06-16). */
export function fromSapDate(value: string): Date {
  const year = Number(value.slice(0, 4))
  const month = Number(value.slice(4, 6))
  const day = Number(value.slice(6, 8))
  return new Date(year, month - 1, day)
}

/**
 * Parses a SAP DATUM (YYYYMMDD) plus UZEIT (HHMMSS) into a single local Date
 * carrying both the day and the time-of-day: ("20260616", "143005") → Date at
 * 2026-06-16 14:30:05. A missing/blank time defaults to midnight.
 */
export function fromSapDateTime(date: string, time: string | undefined): Date {
  const result = fromSapDate(date)
  if (time && /^\d{6}$/.test(time)) {
    result.setHours(Number(time.slice(0, 2)), Number(time.slice(2, 4)), Number(time.slice(4, 6)))
  }
  return result
}

/** Formats a Date for display as DD.MM.YYYY (e.g. "16.06.2026"); empty for undefined. */
export function formatDateShort(date: Date | undefined): string {
  if (date == null) return ''
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}.${date.getFullYear()}`
}

/** Formats a Date's time-of-day for display as HH:MM (e.g. "14:30"); empty for undefined. */
export function formatTimeShort(date: Date | undefined): string {
  if (date == null) return ''
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/** Formats a SAP UZEIT string (HHMMSS) for display without seconds: "143000" → "14:30" */
export function formatSapTime(value: string): string {
  if (!/^\d{6}$/.test(value)) return value
  const hours = value.slice(0, 2)
  const minutes = value.slice(2, 4)
  return `${hours}:${minutes}`
}
