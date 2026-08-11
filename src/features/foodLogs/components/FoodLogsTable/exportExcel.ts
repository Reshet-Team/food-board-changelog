import type { FoodLog } from '@/features/foodLogs/types/foodLog'
import { formatDateShort } from '@/utils/date'
import type { Table } from '@tanstack/react-table'

const COLUMN_WIDTH = 16

function downloadWorkbook(buffer: ArrayBuffer, fileName: string): void {
  const url = URL.createObjectURL(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  // Firefox only honours the click when the anchor is in the DOM, and revoking
  // synchronously can cancel the download before it starts.
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export async function exportExcel(table: Table<FoodLog>): Promise<void> {
  // ExcelJS ships a UMD build that Vite pre-bundles with only a default export,
  // and dynamic imports bypass Vite's named-export interop for CJS deps.
  const { Workbook } = (await import('exceljs')).default

  const tableColumns = table.getVisibleLeafColumns()
  const exportColumns = tableColumns.flatMap((column) => {
    const meta = column.columnDef.meta
    if (meta?.exportColumns) return meta.exportColumns
    const exportValue = meta?.exportValue
    if (!exportValue) return []
    const header = typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id
    return [{ header, value: (row: FoodLog) => exportValue(row) }]
  })

  const headers = exportColumns.map((column) => column.header)
  const body = table
    .getFilteredRowModel()
    .rows.map((row) => exportColumns.map((column) => column.value(row.original)))

  const workbook = new Workbook()
  const worksheet = workbook.addWorksheet('שינויים', { views: [{ rightToLeft: true }] })

  worksheet.addTable({
    name: 'FoodLogs',
    ref: 'A1',
    headerRow: true,
    style: { theme: 'TableStyleMedium2', showRowStripes: true },
    columns: headers.map((name) => ({ name, filterButton: true })),
    rows: body,
  })

  // White overrides the theme header font, which an explicit style would otherwise reset to black.
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headers.forEach((_, index) => {
    worksheet.getColumn(index + 1).width = COLUMN_WIDTH
  })

  const buffer = await workbook.xlsx.writeBuffer()
  downloadWorkbook(buffer, `Food Logs ${formatDateShort(new Date())}.xlsx`)
}
