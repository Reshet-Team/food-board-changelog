import type { FoodLog } from '@/features/foodLogs/types/foodLog'

// ─── Mock dataset ─────────────────────────────────────────────────────────────
// Used automatically when VITE_SAP_API_BASE_URL is not configured, so the screen
// can be exercised end-to-end without a live SAP backend.

const TYPES_OF_CHANGE = ['עדכון כמות', 'הוספת רכיב', 'מחיקת רכיב', 'שינוי תאריך']
const FIELDS = ['כמות', 'תאריך צריכה', 'יום בתקופה', 'חומר']
const USERS = ['DCOHEN', 'MLEVI', 'YBARAK', 'RSHARON']

/** Pads a material number to SAP's CHAR18 zero-padded format. */
function padMaterial(value: number): string {
  return String(value).padStart(18, '0')
}

/** Builds a SAP DATUM string (YYYYMMDD) offset by `dayOffset` days from today. */
function sapDate(dayOffset: number): string {
  const date = new Date()
  date.setDate(date.getDate() + dayOffset)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

/** Builds a SAP UZEIT string (HHMMSS). */
function sapTime(hours: number, minutes: number, seconds: number): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(hours)}${pad(minutes)}${pad(seconds)}`
}

export const MOCK_FOOD_LOGS: FoodLog[] = Array.from({ length: 24 }, (_, index) => {
  const dayOffset = -index
  return {
    typeOfChange: TYPES_OF_CHANGE[index % TYPES_OF_CHANGE.length]!,
    material: padMaterial(1234 + index),
    quantity: Number(((index + 1) * 2.5).toFixed(2)),
    consumptionDate: sapDate(dayOffset - 1),
    dayInPeriod: (index % 30) + 1,
    changeDate: sapDate(dayOffset),
    changeTime: sapTime(index % 24, (index * 7) % 60, (index * 13) % 60),
    changedBy: USERS[index % USERS.length]!,
    field: FIELDS[index % FIELDS.length]!,
    oldValue: String(100 + index),
    newValue: String(150 + index),
  }
})
