import type { FoodLog } from '@/features/foodLogs/types/foodLog'
import { changeTypeLabel } from '@/features/foodLogs/utils/changeType'
import { formatDateShort, formatTimeShort } from '@/utils/date'
import * as XLSX from 'xlsx'

// ─── Excel export ────────────────────────────────────────────────────────────
// Column labels for the exported sheet, kept in step with the table.
const EXCEL_HEADERS = [
  'תאריך שינוי',
  'שעת שינוי',
  'סוג שינוי',
  'חומר',
  'כמות',
  'תאריך צריכה',
  'יום בתקופה',
  'שונה ע"י',
  'שדה',
  'ערך ישן',
  'ערך חדש',
]

/** Builds a real .xlsx workbook from the current rows and downloads it. */
export function exportExcel(rows: FoodLog[]): void {
  const body = rows.map((row) => [
    formatDateShort(row.changeDate),
    formatTimeShort(row.changeDate),
    changeTypeLabel(row.typeOfChange),
    row.material,
    row.quantity,
    formatDateShort(row.consumptionDate),
    row.dayInPeriod ?? '',
    row.changedBy,
    row.field,
    row.oldValue,
    row.newValue,
  ])
  const worksheet = XLSX.utils.aoa_to_sheet([EXCEL_HEADERS, ...body])
  worksheet['!cols'] = EXCEL_HEADERS.map(() => ({ wch: 16 }))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'שינויים')
  XLSX.writeFile(workbook, `Food_Logs_${new Date().toISOString().slice(0, 10)}.xlsx`)
}
