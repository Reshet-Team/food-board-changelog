import DatePicker from '@/components/ui/DatePicker/DatePicker'
import { useAlternatives } from '@/features/foodLogs/hooks/useAlternatives'
import type { FieldProps } from '@uniform-ts/core'
import { useAutoFormContext } from '@uniform-ts/core'
import clsx from 'clsx'
import { useWatch } from 'react-hook-form'
import styles from './FoodLogsSearchForm.module.scss'
import { isDailyAlternative } from './searchRules'

export function DateRangeFieldPicker({ value, onChange, onBlur }: FieldProps) {
  const { control, formMethods } = useAutoFormContext()
  const start = (value as Date | undefined) ?? null

  const end = (useWatch({ control, name: 'dateTo' }) as Date | undefined) ?? null
  const range = start && end ? { start, end } : null

  return (
    <div className={styles.dateFieldWrapper}>
      <DatePicker
        mode="range"
        value={range}
        onChange={(next) => {
          onChange(next?.start ?? null)
          formMethods.setValue('dateTo', next?.end ?? null)
          if (next) onBlur()
        }}
      />
    </div>
  )
}

export function ConsumptionDateRangeFieldPicker({ value, onChange, onBlur }: FieldProps) {
  const { control, formMethods } = useAutoFormContext()
  const { data: alternatives } = useAlternatives()

  const alternative = useWatch({ control, name: 'alternative' }) as string | undefined
  const consumptionEnabled = isDailyAlternative(alternative ?? '', alternatives ?? [])

  const start = (value as Date | undefined) ?? null

  const end = (useWatch({ control, name: 'consumptionDateTo' }) as Date | undefined) ?? null
  const range = start && end ? { start, end } : null

  return (
    <div
      className={clsx(styles.dateFieldWrapper, !consumptionEnabled && styles.disabledField)}
      inert={!consumptionEnabled || undefined}
    >
      <DatePicker
        mode="range"
        value={range}
        onChange={(next) => {
          onChange(next?.start ?? undefined)
          formMethods.setValue('consumptionDateTo', next?.end ?? undefined)
          onBlur()
        }}
      />
    </div>
  )
}
