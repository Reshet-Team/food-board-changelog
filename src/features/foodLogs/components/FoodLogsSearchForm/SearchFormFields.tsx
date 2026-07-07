import {
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxRoot,
} from '@/components/ui/Combobox/Combobox'
import { FieldLabel, FieldRoot } from '@/components/ui/Field/Field'
import { Input } from '@/components/ui/Input/Input'
import { useAlternatives } from '@/features/foodLogs/hooks/useAlternatives'
import type { AlternativeOption } from '@/features/foodLogs/types/foodLog'
import type { FieldProps, FieldWrapperProps } from '@uniform-ts/core'
import { useAutoFormContext } from '@uniform-ts/core'
import { useWatch } from 'react-hook-form'
import styles from './FoodLogsSearchForm.module.scss'
import { isDailyAlternative, validateDateRange } from './searchRules'

const REQUIRED_FIELDS = new Set(['foodBoard', 'alternative', 'dateFrom'])

export function FormFieldWrapper({ children, field, error }: FieldWrapperProps) {
  const { control } = useAutoFormContext()
  const { data: alternatives } = useAlternatives()

  const alternative = useWatch({ control, name: 'alternative' }) as string | undefined
  const consumptionEnabled = isDailyAlternative(alternative ?? '', alternatives ?? [])

  const dateFrom = useWatch({ control, name: 'dateFrom' }) as Date | undefined
  const dateTo = useWatch({ control, name: 'dateTo' }) as Date | undefined
  const consumptionFrom = useWatch({ control, name: 'consumptionDateFrom' }) as Date | undefined

  const isRequired =
    REQUIRED_FIELDS.has(field.name) || (field.name === 'consumptionDateFrom' && consumptionEnabled)
  const label = field.meta.label ?? field.label

  let displayError = error
  if (field.name === 'dateFrom') {
    displayError = validateDateRange(dateFrom, dateTo) ?? error
  }
  if (field.name === 'consumptionDateFrom') {
    displayError =
      (consumptionEnabled && !consumptionFrom ? 'יש לבחור טווח תאריכי צריכה' : null) ?? error
  }
  return (
    <FieldRoot>
      {isRequired ? (
        <FieldLabel indicator="required">{label}</FieldLabel>
      ) : (
        <FieldLabel>{label}</FieldLabel>
      )}
      {children}
      {displayError && (
        <span role="alert" className={styles.fieldError}>
          {displayError}
        </span>
      )}
    </FieldRoot>
  )
}

export function StringInput({ value, onChange, onBlur, ref }: FieldProps) {
  return (
    <Input
      ref={ref as React.Ref<HTMLInputElement>}
      autoComplete="off"
      value={(value as string | undefined) ?? ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
  )
}

export function NumericInput({ value, onChange, onBlur, ref }: FieldProps) {
  return (
    <Input
      ref={ref as React.Ref<HTMLInputElement>}
      inputMode="numeric"
      autoComplete="off"
      value={(value as string | undefined) ?? ''}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, '')
        onChange(digits)
      }}
      onBlur={onBlur}
    />
  )
}

export function AlternativeSelect({ value, onChange, onBlur }: FieldProps) {
  const { data: alternatives, isLoading } = useAlternatives()
  const options = alternatives ?? []
  const current = (value as string | undefined) ?? ''

  const formatOption = (option: AlternativeOption) => `${option.value} — ${option.description}`

  const selectedOption = options.find((option) => option.value === current) ?? null

  return (
    <ComboboxRoot<AlternativeOption>
      items={options}
      value={selectedOption}
      onValueChange={(next: AlternativeOption | null) => {
        onChange(next?.value ?? '')
        onBlur()
      }}
      itemToStringLabel={(option: AlternativeOption) => formatOption(option)}
      itemToStringValue={(option: AlternativeOption) => option.value}
      disabled={isLoading}
    >
      <ComboboxInput
        size="md"
        placeholder={isLoading ? 'טוען…' : 'בחר חלופה'}
        inputProps={{ onBlur: () => onBlur() }}
      />
      <ComboboxList<AlternativeOption> emptyMessage="לא נמצאו חלופות">
        {(option: AlternativeOption) => (
          <ComboboxItem key={option.value} value={option}>
            {formatOption(option)}
          </ComboboxItem>
        )}
      </ComboboxList>
    </ComboboxRoot>
  )
}
