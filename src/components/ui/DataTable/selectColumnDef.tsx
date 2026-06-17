import { Checkbox } from '@/components/ui/Checkbox/Checkbox'
import type { ColumnDef } from '@tanstack/react-table'

export const selectColumnDef: ColumnDef<unknown> = {
  id: 'select',
  header: ({ table }) => (
    <Checkbox
      checked={table.getIsAllPageRowsSelected()}
      indeterminate={table.getIsSomeRowsSelected()}
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={row.getToggleSelectedHandler()}
      aria-label="Select row"
    />
  ),
  size: 10,
  minSize: 10,
} as const
