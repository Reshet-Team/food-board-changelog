import DatePicker from '@/components/ui/DatePicker/DatePicker'
import { useAlternatives } from '@/features/foodLogs/hooks/useAlternatives'
import type { FieldProps } from '@uniform-ts/core'
import { useAutoFormContext } from '@uniform-ts/core'
import clsx from 'clsx'
import { useWatch } from 'react-hook-form'
import styles from './FoodLogsSearchForm.module.scss'
import { isDailyAlternative } from './searchRules'

type RangeToField = 'dateTo' | 'consumptionDateTo'

interface RangeDatePickerProps extends FieldProps {
  toFieldName: RangeToField
  emptyValue?: Date | null | undefined
  disabled?: boolean
  blurOnComplete?: boolean
}

function RangeDatePicker({
  value,
  onChange,
  onBlur,
  toFieldName,
  emptyValue = null,
  disabled = false,
  blurOnComplete = false,
}: RangeDatePickerProps) {
  const { control, formMethods } = useAutoFormContext()
  const start = (value as Date | undefined) ?? null
  const end = (useWatch({ control, name: toFieldName }) as Date | undefined) ?? null
  const range = start && end ? { start, end } : null

  return (
    <div
      className={clsx(styles.dateFieldWrapper, disabled && styles.disabledField)}
      inert={disabled || undefined}
    >
      <DatePicker
        mode="range"
        value={range}
        onChange={(next) => {
          onChange(next?.start ?? emptyValue)
          formMethods.setValue(toFieldName, next?.end ?? emptyValue)
          if (!blurOnComplete || next) onBlur()
        }}
      />
    </div>
  )
}

export function DateRangeFieldPicker(props: FieldProps) {
  return <RangeDatePicker {...props} toFieldName="dateTo" emptyValue={null} blurOnComplete />
}

export function ConsumptionDateRangeFieldPicker(props: FieldProps) {
  const { control } = useAutoFormContext()
  const { data: alternatives } = useAlternatives()

  const alternative = useWatch({ control, name: 'alternative' }) as string | undefined
  const consumptionEnabled = isDailyAlternative(alternative ?? '', alternatives ?? [])

  return (
    <RangeDatePicker
      {...props}
      toFieldName="consumptionDateTo"
      emptyValue={undefined}
      disabled={!consumptionEnabled}
    />
  )
}
