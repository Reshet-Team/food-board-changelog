export function toSapDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

export function fromSapDate(value: string): Date | undefined {
  const [year, month, day] = value.split('-').map(Number)
  // An "initial" SAP date (e.g. "0000-00-00") has a zero year/month/day and
  // means "no date". Treat it (and any unparseable value) as undefined.
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

export function fromSapDateTime(date: string, time: string | undefined): Date {
  const result = fromSapDate(date) ?? new Date(NaN)
  if (time && /^\d{2}:\d{2}/.test(time)) {
    const [hours, minutes, seconds] = time.split(':').map(Number)
    result.setHours(hours ?? 0, minutes ?? 0, seconds ?? 0)
  }
  return result
}

export function formatDateShort(date: Date | undefined): string {
  if (date == null || Number.isNaN(date.getTime())) return ''
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}.${date.getFullYear()}`
}

export function formatDateRange(from: Date | undefined, to: Date | undefined): string {
  if (from == null) return formatDateShort(to)
  if (to == null) return formatDateShort(from)
  return `${formatDateShort(from)} - ${formatDateShort(to)}`
}

export function formatTimeShort(date: Date | undefined): string {
  if (date == null || Number.isNaN(date.getTime())) return ''
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}
