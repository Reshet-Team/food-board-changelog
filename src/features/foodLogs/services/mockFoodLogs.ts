import type { FoodLog, FoodLogsFilter, RawFoodLog } from '@/features/foodLogs/types/foodLog'
import { classifyChangeType } from '@/features/foodLogs/utils/changeType'
import { toFoodLog } from '@/features/foodLogs/utils/parseFoodLog'
import { toSapDate } from '@/utils/date'

// ─── Mock dataset ─────────────────────────────────────────────────────────────
// Used automatically when VITE_SAP_API_BASE_URL is not configured, so the screen
// can be exercised end-to-end without a live SAP backend.

// Raw SAP change-document indicator codes, exactly as the DB delivers them:
// I/J = insert, U = update, D/E = delete.
const TYPES_OF_CHANGE = ['I', 'U', 'D', 'E', 'J']
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

/** Formats a SAP DATUM (YYYYMMDD) as a readable DD/MM/YYYY value. */
function readableDate(dayOffset: number): string {
  const sap = sapDate(dayOffset)
  return `${sap.slice(6, 8)}/${sap.slice(4, 6)}/${sap.slice(0, 4)}`
}

// Produces an old/new value pair that matches the kind of field being changed,
// so a date change shows dates, a material change shows material numbers, etc.
// — instead of every row looking like a quantity edit.
function valuesForField(field: string, index: number): { oldValue: string; newValue: string } {
  switch (field) {
    case 'תאריך צריכה':
      return { oldValue: readableDate(-index - 1), newValue: readableDate(-index) }
    case 'יום בתקופה':
      return { oldValue: String((index % 30) + 1), newValue: String(((index + 3) % 30) + 1) }
    case 'חומר':
      return { oldValue: padMaterial(1234 + index), newValue: padMaterial(1334 + index) }
    case 'כמות':
    default:
      return {
        oldValue: ((index + 1) * 2.5).toFixed(2),
        newValue: ((index + 1) * 2.5 + 5).toFixed(2),
      }
  }
}

// Builds a single mock row for the given index. The index seeds all the varied
// fields (dates, materials, users…) so each row looks distinct. Produced in the
// raw SAP wire shape (YYYYMMDD strings); `filterMockFoodLogs` parses it on the
// way out, exactly like the real API.
function buildFoodLog(index: number): RawFoodLog {
  const dayOffset = -index
  const field = FIELDS[index % FIELDS.length]!
  const typeOfChange = TYPES_OF_CHANGE[index % TYPES_OF_CHANGE.length]!
  const category = classifyChangeType(typeOfChange)
  const values = valuesForField(field, index)
  // SAP only fills the relevant side: a delete carries just the old value, an
  // insert just the new value, and an update carries both.
  const oldValue = category === 'add' ? '' : values.oldValue
  const newValue = category === 'delete' ? '' : values.newValue
  // consumptionDate and dayInPeriod are optional in real data — leave them off
  // every 4th row so the table is exercised with missing values.
  const hasPeriodInfo = index % 4 !== 0
  return {
    typeOfChange,
    material: padMaterial(1234 + index),
    quantity: Number(((index + 1) * 2.5).toFixed(2)),
    changeDate: sapDate(dayOffset),
    changeTime: sapTime(index % 24, (index * 7) % 60, (index * 13) % 60),
    changedBy: USERS[index % USERS.length]!,
    field,
    oldValue,
    newValue,
    ...(hasPeriodInfo && {
      consumptionDate: sapDate(dayOffset - 1),
      dayInPeriod: (index % 30) + 1,
    }),
  }
}

// Mock-only wrapper: the real food-log GET doesn't return an alternative (it's a
// server-side filter), but the mock tags each row so it can mimic that filter.
interface MockRow {
  alternative: string
  log: RawFoodLog
}

// Base spread across alternatives 01–06 so each dropdown option returns its own
// subset of rows (matches the alternatives API values).
const BASE_FOOD_LOGS: MockRow[] = Array.from({ length: 24 }, (_, index) => ({
  alternative: String((index % 6) + 1).padStart(2, '0'),
  log: buildFoodLog(index),
}))

// Alternative "01" is the primary demo target, so top it up to 15 rows total.
const alt01Count = BASE_FOOD_LOGS.filter((row) => row.alternative === '01').length
const ALTERNATIVE_01_EXTRA: MockRow[] = Array.from({ length: 15 - alt01Count }, (_, i) => ({
  alternative: '01',
  log: buildFoodLog(24 + i),
}))

const MOCK_FOOD_LOGS: MockRow[] = [...BASE_FOOD_LOGS, ...ALTERNATIVE_01_EXTRA]

// Filters the in-memory mock dataset by the search criteria, mimicking SAP's
// server-side filtering so the screen behaves like the real search while
// running without a backend. Delete this together with the mock dataset once
// the live SAP backend is wired up.
export function filterMockFoodLogs(filter: FoodLogsFilter): FoodLog[] {
  // Empty-state demo: searching food board "0" returns no rows.
  if (filter.foodBoard === '0') return []

  const from = filter.consumptionDateFrom ? toSapDate(filter.consumptionDateFrom) : null
  const to = filter.consumptionDateTo ? toSapDate(filter.consumptionDateTo) : null

  return MOCK_FOOD_LOGS.filter((row) => {
    // Alternative: the mandatory ALTNR filter — keep only rows of that alternative.
    if (row.alternative !== filter.alternative) return false

    const log = row.log

    // Material: match if the row's (zero-padded) material equals any entered
    // value, compared numerically so "1234" matches "000000000000001234".
    if (filter.material?.length) {
      const matches = filter.material.some((value) => Number(value) === Number(log.material))
      if (!matches) return false
    }

    // Changed by: match if the row's user equals any entered value (case-insensitive).
    if (filter.changedBy?.length) {
      const matches = filter.changedBy.some(
        (value) => value.toLowerCase() === log.changedBy.toLowerCase(),
      )
      if (!matches) return false
    }

    // Consumption date: keep rows whose date falls within the range. Rows with
    // no consumption date are excluded once a consumption-date filter is set.
    if (from && (log.consumptionDate == null || log.consumptionDate < from)) return false
    if (to && (log.consumptionDate == null || log.consumptionDate > to)) return false

    return true
  }).map((row) => toFoodLog(row.log))
}
