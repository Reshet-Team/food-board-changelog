'use no memo'

import { Button } from '@/components/ui/Button/Button'
import { useDataTableContext } from '@/components/ui/DataTable/DataTableContext'
import { Input } from '@/components/ui/Input/Input'
import { exportExcel } from '@/features/foodLogs/components/FoodLogsTable/exportExcel'
import type { FoodLog } from '@/features/foodLogs/types/foodLog'
import { FileSpreadsheet, Search } from 'lucide-react'
import type { ChangeEvent, ReactNode } from 'react'
import styles from './FoodLogsTable.module.scss'

interface FoodLogsTableToolbarProps {
  filtersSlot?: ReactNode
}

export function FoodLogsTableToolbar({ filtersSlot }: FoodLogsTableToolbarProps) {
  const { table } = useDataTableContext<FoodLog>()

  if (table.getPreFilteredRowModel().rows.length === 0) return null

  const globalFilter = (table.getState().globalFilter as string | undefined) ?? ''
  const filteredRows = table.getFilteredRowModel().rows

  return (
    <div className={styles.tableToolbar}>
      <div className={styles.toolbarControls}>
        <Input
          size="sm"
          className={styles.searchInput}
          placeholder="חיפוש בכל השדות…"
          aria-label="חיפוש בטבלה"
          value={globalFilter}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            table.setGlobalFilter(event.currentTarget.value)
          }
          startSlot={<Search size="1rem" aria-hidden />}
        />
        {filtersSlot}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => exportExcel(filteredRows.map((row) => row.original))}
        >
          <FileSpreadsheet size="1rem" aria-hidden />
          ייצוא לאקסל
        </Button>
      </div>
      <span className={styles.count}>
        מציג <strong>{filteredRows.length}</strong> שינויים
      </span>
    </div>
  )
}
