import type {
  AlternativeOption,
  FoodLogsFilter,
  RawFoodLog,
} from '@/features/foodLogs/types/foodLog'
import { classifyChangeType } from '@/features/foodLogs/utils/changeType'

const NETWORK_DELAY_MS = 350
const ROW_COUNT = 45
const DAY_MS = 86_400_000

const MATERIALS = ['100001', '100002', '100003', '100004', '100005', '100006']
const USERS = ['דנה כהן', 'יוסי לוי', 'מיכל אברהם', 'רון שפירא', 'נועה מזרחי']
const FIELDS = ['כמות', 'יחידת מידה', 'מנה', 'הערה']
// SAP sends I/J for additions and D/E for deletions; anything else counts as an update.
const CHANGE_CODES = ['I', 'J', 'D', 'E', 'U', 'U', 'U']

// Types 4 and 6 mark a "daily" alternative, which unlocks the consumption date range.
export const mockAlternatives: AlternativeOption[] = [
  { value: '01', type: '1', description: 'תפריט בסיס' },
  { value: '02', type: '4', description: 'תפריט יומי' },
  { value: '03', type: '2', description: 'תפריט חורף' },
  { value: '04', type: '6', description: 'תפריט יומי מיוחד' },
  { value: '05', type: '3', description: 'תפריט קיץ' },
]

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Deterministic PRNG so an identical search always returns identical rows.
function createRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedFrom(value: string): number {
  let hash = 0
  for (const char of value) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) | 0
  return hash
}

function pick<T>(items: readonly T[], random: () => number): T {
  const item = items[Math.floor(random() * items.length)]
  if (item === undefined) throw new Error('pick called with an empty list')
  return item
}

function randomInt(random: () => number, min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1))
}

// fromSapDate parses YYYY-MM-DD, which is what the service returns.
function toSapResponseDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export async function fetchMockAlternatives(): Promise<AlternativeOption[]> {
  await delay(NETWORK_DELAY_MS)
  return mockAlternatives
}

export async function fetchMockFoodLogs(filter: FoodLogsFilter): Promise<RawFoodLog[]> {
  await delay(NETWORK_DELAY_MS)

  const random = createRandom(
    seedFrom(
      [
        filter.foodBoard,
        filter.alternative,
        toSapResponseDate(filter.dateFrom),
        toSapResponseDate(filter.dateTo),
      ].join('|'),
    ),
  )

  const materials = filter.material?.length ? filter.material : MATERIALS
  const users = filter.changedBy?.length ? filter.changedBy : USERS
  const rangeStart = filter.dateFrom.getTime()
  const rangeSpan = Math.max(filter.dateTo.getTime() - rangeStart, 0)

  const rows = Array.from({ length: ROW_COUNT }, (): RawFoodLog => {
    const changeDate = new Date(rangeStart + random() * rangeSpan)
    const changeTime = [
      randomInt(random, 7, 19),
      randomInt(random, 0, 59),
      randomInt(random, 0, 59),
    ]
      .map((part) => String(part).padStart(2, '0'))
      .join(':')

    const firstDay = new Date(changeDate.getTime() - randomInt(random, 0, 6) * DAY_MS)
    const consumptionFrom = filter.consumptionDateFrom ?? firstDay
    const consumptionTo =
      filter.consumptionDateTo ??
      new Date(consumptionFrom.getTime() + randomInt(random, 1, 6) * DAY_MS)

    const code = pick(CHANGE_CODES, random)
    const category = classifyChangeType(code)
    const oldQuantity = String(randomInt(random, 10, 500))
    const newQuantity = String(randomInt(random, 10, 500))

    return {
      typeOfChange: code,
      material: pick(materials, random),
      quantity: randomInt(random, 10, 500),
      consumptionDateFrom: toSapResponseDate(consumptionFrom),
      consumptionDateTo: toSapResponseDate(consumptionTo),
      firstDay: toSapResponseDate(firstDay),
      dayInPeriod: randomInt(random, 1, 7),
      changeDate: toSapResponseDate(changeDate),
      changeTime,
      changedBy: pick(users, random),
      field: pick(FIELDS, random),
      oldValue: category === 'add' ? '' : oldQuantity,
      newValue: category === 'delete' ? '' : newQuantity,
    }
  })

  return rows.sort((a, b) =>
    `${b.changeDate}${b.changeTime}`.localeCompare(`${a.changeDate}${a.changeTime}`),
  )
}
