import type { FoodLog } from '@/features/foodLogs/types/foodLog'
import { changeTypeLabel } from '@/features/foodLogs/utils/changeType'
import { formatDateShort, formatTimeShort, toSapDate } from '@/utils/date'
import type { FilterFn } from '@tanstack/react-table'

// ─── Global search ───────────────────────────────────────────────────────────
// Joins every displayed field of a row — including the human-formatted dates
// and times — into one lowercase haystack so the search bar can match against
// anything the user actually sees in the table.
function rowSearchText(row: FoodLog): string {
  return [
    changeTypeLabel(row.typeOfChange),
    row.material,
    row.quantity,
    formatDateShort(row.consumptionDate),
    row.consumptionDate ? toSapDate(row.consumptionDate) : '',
    row.dayInPeriod,
    formatDateShort(row.changeDate),
    toSapDate(row.changeDate),
    formatTimeShort(row.changeDate),
    row.changedBy,
    row.field,
    row.oldValue,
    row.newValue,
  ]
    .join(' ')
    .toLowerCase()
}

/** Returns true when the row matches the (already trimmed, lowercased) query. */
export function matchesQuery(row: FoodLog, query: string): boolean {
  return rowSearchText(row).includes(query)
}

// TanStack Table global filter: delegates to the shared matcher above so the
// table and the row-count/export stay perfectly in sync.
export const globalFilterFn: FilterFn<FoodLog> = (row, _columnId, filterValue: string) =>
  matchesQuery(row.original, filterValue.trim().toLowerCase())
