import type { FoodLog, FoodLogsFilter, RawFoodLog } from '@/features/foodLogs/types/foodLog'
import { classifyChangeType } from '@/features/foodLogs/utils/changeType'
import { toFoodLog } from '@/features/foodLogs/utils/parseFoodLog'
import { toSapDate } from '@/utils/date'

const TYPES_OF_CHANGE = ['I', 'U', 'D', 'E', 'J']
const FIELDS = ['כמות', 'תאריך צריכה', 'יום בתקופה', 'חומר']
const UPDATE_FIELDS = ['כמות', 'חומר']
const USERS = ['DCOHEN', 'MLEVI', 'YBARAK', 'RSHARON']

function padMaterial(value: number): string {
  return String(10000000 + value)
}

function sapDate(dayOffset: number): string {
  const date = new Date()
  date.setDate(date.getDate() + dayOffset)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

function sapTime(hours: number, minutes: number, seconds: number): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(hours)}${pad(minutes)}${pad(seconds)}`
}

function readableDate(dayOffset: number): string {
  const sap = sapDate(dayOffset)
  return `${sap.slice(6, 8)}/${sap.slice(4, 6)}/${sap.slice(0, 4)}`
}

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

function buildFoodLog(index: number): RawFoodLog {
  const dayOffset = -index
  const typeOfChange = TYPES_OF_CHANGE[index % TYPES_OF_CHANGE.length]!
  const category = classifyChangeType(typeOfChange)
  const fieldPool = category === 'update' ? UPDATE_FIELDS : FIELDS
  const field = fieldPool[index % fieldPool.length]!
  const values = valuesForField(field, index)

  const oldValue = category === 'add' ? '' : values.oldValue
  const newValue = category === 'delete' ? '' : values.newValue

  const hasPeriodInfo = index % 4 !== 0
  const hasRange = index % 3 === 0
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
      consumptionDateFrom: sapDate(dayOffset - 1),
      ...(hasRange ? { consumptionDateTo: sapDate(dayOffset - 1 + 4) } : {}),
      firstDay: sapDate(dayOffset - (index % 30)),
      dayInPeriod: (index % 30) + 1,
    }),
  }
}

interface MockRow {
  alternative: string
  log: RawFoodLog
}

const BASE_FOOD_LOGS: MockRow[] = Array.from({ length: 24 }, (_, index) => ({
  alternative: String((index % 6) + 1).padStart(2, '0'),
  log: buildFoodLog(index),
}))

const alt01Count = BASE_FOOD_LOGS.filter((row) => row.alternative === '01').length
const ALTERNATIVE_01_EXTRA: MockRow[] = Array.from({ length: 15 - alt01Count }, (_, i) => ({
  alternative: '01',
  log: buildFoodLog(24 + i),
}))

const MOCK_FOOD_LOGS: MockRow[] = [...BASE_FOOD_LOGS, ...ALTERNATIVE_01_EXTRA]

export function filterMockFoodLogs(filter: FoodLogsFilter): FoodLog[] {
  if (filter.foodBoard === '0') return []

  const from = filter.consumptionDateFrom ? toSapDate(filter.consumptionDateFrom) : null
  const to = filter.consumptionDateTo ? toSapDate(filter.consumptionDateTo) : null

  return MOCK_FOOD_LOGS.filter((row) => {
    if (row.alternative !== filter.alternative) return false

    const log = row.log

    if (filter.material?.length) {
      const matches = filter.material.some((value) => Number(value) === Number(log.material))
      if (!matches) return false
    }

    if (filter.changedBy?.length) {
      const matches = filter.changedBy.some(
        (value) => value.toLowerCase() === log.changedBy.toLowerCase(),
      )
      if (!matches) return false
    }

    if (from && (log.consumptionDateFrom == null || log.consumptionDateFrom < from)) return false
    if (to && (log.consumptionDateFrom == null || log.consumptionDateFrom > to)) return false

    return true
  }).map((row) => toFoodLog(row.log))
}
