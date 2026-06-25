import {
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxRoot,
} from '@/components/ui/Combobox/Combobox'
import DatePicker from '@/components/ui/DatePicker/DatePicker'
import { FieldLabel, FieldRoot } from '@/components/ui/Field/Field'
import { Input } from '@/components/ui/Input/Input'
import { useAlternatives } from '@/features/foodLogs/hooks/useAlternatives'
import type { AlternativeOption } from '@/features/foodLogs/types/foodLog'
import type { FieldProps, FieldWrapperProps } from '@uniform-ts/core'
import { useAutoFormContext } from '@uniform-ts/core'
import clsx from 'clsx'
import { X } from 'lucide-react'
import { useState } from 'react'
import { isDailyAlternative } from './dailyAlternative'
import { validateDateRange } from './dateRange'
import styles from './FoodLogsSearchForm.module.scss'

// ─── Required field names (for showing the * indicator) ──────────────────────
const REQUIRED_FIELDS = new Set(['foodBoard', 'alternative', 'dateFrom'])

// ─── Custom field wrapper — adds label with required indicator ────────────────
export function FormFieldWrapper({ children, field, error }: FieldWrapperProps) {
  // Read the shared form state straight from UniForm instead of a manual context.
  const { formMethods } = useAutoFormContext()
  const { data: alternatives } = useAlternatives()

  const alternative = (formMethods.watch('alternative') as string | undefined) ?? ''
  // "Daily" alternatives require a consumption date; others can't have one.
  const consumptionEnabled = isDailyAlternative(alternative, alternatives ?? [])

  // consumptionDateFrom is required only when the chosen alternative needs one.
  const isRequired =
    REQUIRED_FIELDS.has(field.name) || (field.name === 'consumptionDateFrom' && consumptionEnabled)
  const label = field.meta.label ?? field.label

  // For the date fields, show the live range/consumption error over any form error.
  let displayError = error
  if (field.name === 'dateFrom') {
    const dateFrom = formMethods.watch('dateFrom') as Date | undefined
    const dateTo = formMethods.watch('dateTo') as Date | undefined
    displayError = validateDateRange(dateFrom, dateTo) ?? error
  }
  if (field.name === 'consumptionDateFrom') {
    const consumptionFrom = formMethods.watch('consumptionDateFrom') as Date | undefined
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

// ─── Custom field components ──────────────────────────────────────────────────

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

// Numeric-only input — rejects any character that is not a digit.
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

// Alternative dropdown — populated directly from the alternatives API.
// Uses a Combobox so the user can type to filter the (potentially ~100) options.
export function AlternativeSelect({ value, onChange, onBlur }: FieldProps) {
  const { data: alternatives, isLoading } = useAlternatives()
  const options = alternatives ?? []
  const current = (value as string | undefined) ?? ''

  // Each option is shown as "value — type description" so the user sees both.
  const formatOption = (option: AlternativeOption) => `${option.value} — ${option.typeDescription}`
  // The currently selected option object (or null when nothing is chosen).
  const selectedOption = options.find((option) => option.value === current) ?? null

  return (
    <ComboboxRoot<AlternativeOption>
      items={options}
      value={selectedOption}
      onValueChange={(next: AlternativeOption | null) => {
        // Store only the option's value (e.g. "04") as the form field value.
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

// Range date picker — renders as the dateFrom field but controls both dates.
// `dateFrom` is its own field value; `dateTo` is read/written via the form.
export function DateRangeFieldPicker({ value, onChange, onBlur }: FieldProps) {
  const { formMethods } = useAutoFormContext()
  const start = (value as Date | undefined) ?? null
  const end = (formMethods.watch('dateTo') as Date | undefined) ?? null
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
  const { formMethods } = useAutoFormContext()
  const { data: alternatives } = useAlternatives()
  const alternative = (formMethods.watch('alternative') as string | undefined) ?? ''
  const consumptionEnabled = isDailyAlternative(alternative, alternatives ?? [])

  const start = (value as Date | undefined) ?? null
  const end = (formMethods.watch('consumptionDateTo') as Date | undefined) ?? null
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

// Chips input — collects multiple values. Type a value and press Enter (or
// comma) to add it as a removable chip. Backspace on an empty input removes the
// last chip. `digitsOnly` restricts entry to digits (used for material numbers).
function ChipsInput({
  value,
  onChange,
  onBlur,
  inputRef,
  digitsOnly,
}: {
  value: string[] | undefined
  onChange: (next: string[]) => void
  onBlur: () => void
  inputRef?: React.Ref<HTMLInputElement>
  digitsOnly: boolean
}) {
  const [draft, setDraft] = useState('')
  const chips = value ?? []

  function addChip() {
    const trimmed = draft.trim()
    if (!trimmed || chips.includes(trimmed)) {
      setDraft('')
      return
    }
    onChange([...chips, trimmed])
    setDraft('')
  }

  function removeChip(index: number) {
    onChange(chips.filter((_, i) => i !== index))
  }

  return (
    <div className={styles.chipsField}>
      {chips.length > 0 && (
        <ul className={styles.chipList}>
          {chips.map((chip, index) => (
            <li key={chip} className={styles.chip}>
              <span>{chip}</span>
              <button
                type="button"
                className={styles.chipRemove}
                aria-label={`הסר ${chip}`}
                onClick={() => removeChip(index)}
              >
                <X size="0.75rem" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Input
        ref={inputRef}
        autoComplete="off"
        inputMode={digitsOnly ? 'numeric' : undefined}
        placeholder="הקלידו ולחצו על ENTER להוספה"
        value={draft}
        onChange={(e) => {
          const next = digitsOnly ? e.target.value.replace(/\D/g, '') : e.target.value
          setDraft(next)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addChip()
          } else if (e.key === 'Backspace' && !draft && chips.length > 0) {
            removeChip(chips.length - 1)
          }
        }}
        onBlur={() => {
          addChip()
          onBlur()
        }}
      />
    </div>
  )
}

// Material chips — restricted to digit-only values.
export function MaterialChipsInput({ value, onChange, onBlur, ref }: FieldProps<string[]>) {
  return (
    <ChipsInput
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      inputRef={ref as React.Ref<HTMLInputElement>}
      digitsOnly
    />
  )
}

// Changed-by chips — free-text usernames.
export function ChangedByChipsInput({ value, onChange, onBlur, ref }: FieldProps<string[]>) {
  return (
    <ChipsInput
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      inputRef={ref as React.Ref<HTMLInputElement>}
      digitsOnly={false}
    />
  )
}
