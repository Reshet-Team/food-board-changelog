'use no memo'

import { Empty as EmptyRoot, EmptyTitle } from '@/components/ui/Empty/Empty'
import { useDataTableContext } from './DataTableContext'
import styles from './Empty.module.scss'
import TablePrimitive from './TablePrimitive'

export interface EmptyProps {
  message?: string
}

export function Empty({ message }: EmptyProps) {
  const { table } = useDataTableContext()
  const colSpan = table.getHeaderGroups()[0]?.headers.length ?? table.getAllFlatColumns().length

  return (
    <TablePrimitive.TableRow>
      <TablePrimitive.TableCell colSpan={colSpan} className={styles.noResultsCell}>
        <EmptyRoot>
          <EmptyTitle>{message ?? 'No data to display'}</EmptyTitle>
        </EmptyRoot>
      </TablePrimitive.TableCell>
    </TablePrimitive.TableRow>
  )
}
