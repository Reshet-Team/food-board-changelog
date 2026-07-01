export function formatDate(date: Date, locale = 'he-IL'): string {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function toSapDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

export function formatSapDate(value: string | undefined): string {
  if (value == null) return ''
  if (!/^\d{8}$/.test(value)) return value
  const year = value.slice(0, 4)
  const month = value.slice(4, 6)
  const day = value.slice(6, 8)
  return `${day}.${month}.${year}`
}

export function fromSapDate(value: string): Date {
  const year = Number(value.slice(0, 4))
  const month = Number(value.slice(4, 6))
  const day = Number(value.slice(6, 8))
  return new Date(year, month - 1, day)
}

export function fromSapDateTime(date: string, time: string | undefined): Date {
  const result = fromSapDate(date)
  if (time && /^\d{6}$/.test(time)) {
    result.setHours(Number(time.slice(0, 2)), Number(time.slice(2, 4)), Number(time.slice(4, 6)))
  }
  return result
}

export function formatDateShort(date: Date | undefined): string {
  if (date == null) return ''
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}.${date.getFullYear()}`
}

export function formatTimeShort(date: Date | undefined): string {
  if (date == null) return ''
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function formatSapTime(value: string): string {
  if (!/^\d{6}$/.test(value)) return value
  const hours = value.slice(0, 2)
  const minutes = value.slice(2, 4)
  return `${hours}:${minutes}`
}
