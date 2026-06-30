import DatePicker from '@/components/ui/DatePicker/DatePicker'
import { useAlternatives } from '@/features/foodLogs/hooks/useAlternatives'
import type { FieldProps } from '@uniform-ts/core'
import { useAutoFormContext } from '@uniform-ts/core'
import clsx from 'clsx'
import { useWatch } from 'react-hook-form'
import styles from './FoodLogsSearchForm.module.scss'
import { isDailyAlternative } from './searchRules'

// Range date picker — renders as the dateFrom field but controls both dates.
// `dateFrom` is its own field value; `dateTo` is read/written via the form.
export function DateRangeFieldPicker({ value, onChange, onBlur }: FieldProps) {
  const { control, formMethods } = useAutoFormContext()
  const start = (value as Date | undefined) ?? null
  // `useWatch` makes the sibling `dateTo` read reactive, so the picker re-renders
  // and displays the full range as soon as either end of the range changes.
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

// Consumption-date range picker. Greyed out and non-interactive (via `inert`)
// when the chosen alternative doesn't support a consumption date. Like the
// change-date picker it controls a pair of form fields.
export function ConsumptionDateRangeFieldPicker({ value, onChange, onBlur }: FieldProps) {
  const { control, formMethods } = useAutoFormContext()
  const { data: alternatives } = useAlternatives()
  // Enabled state depends on the *alternative* field. `useWatch` keeps it
  // reactive so the picker enables/disables as the alternative changes.
  const alternative = useWatch({ control, name: 'alternative' }) as string | undefined
  const consumptionEnabled = isDailyAlternative(alternative ?? '', alternatives ?? [])

  const start = (value as Date | undefined) ?? null
  // Reactive sibling read — without `useWatch` the second date would stay stale
  // and the picker would never show the selected range.
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
