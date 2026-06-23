import { Button } from '@/components/ui/Button/Button'
import { Checkbox } from '@/components/ui/Checkbox/Checkbox'
import type { DateRangeValue } from '@/components/ui/DatePicker/DatePicker'
import DatePicker from '@/components/ui/DatePicker/DatePicker'
import { FieldLabel, FieldRoot } from '@/components/ui/Field/Field'
import { Input } from '@/components/ui/Input/Input'
import { SelectItem, SelectList, SelectRoot, SelectTrigger } from '@/components/ui/Select/Select'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { useAlternatives } from '@/features/foodLogs/hooks/useAlternatives'
import type { AlternativeOption, FoodLogsSearchParams } from '@/features/foodLogs/types/foodLog'
import { foodLogsSearchSchema } from '@/features/foodLogs/types/foodLog'
import {
  ALL_CHANGE_TYPES,
  CHANGE_TYPE_OPTIONS,
  type ChangeType,
} from '@/features/foodLogs/utils/changeType'
import { useNavigate } from '@tanstack/react-router'
import type {
  AutoFormHandle,
  FieldProps,
  FieldWrapperProps,
  SubmitButtonProps,
} from '@uniform-ts/core'
import { AutoForm, createForm } from '@uniform-ts/core'
import clsx from 'clsx'
import { Filter, X } from 'lucide-react'
import { createContext, useContext, useRef, useState } from 'react'
import styles from './FoodLogsSearchForm.module.scss'

// ─── UniForm definition (created once, outside the component) ────────────────
const searchForm = createForm(foodLogsSearchSchema)

// ─── Required field names (for showing the * indicator) ──────────────────────
const REQUIRED_FIELDS = new Set(['foodBoard', 'alternative', 'dateFrom'])

// ─── Context for passing button state into the submit button slot ─────────────
// The submit button component must be defined outside the parent component
// to keep a stable reference. We use React context to pass state into it.
interface FormActionsContextValue {
  isDisabled: boolean
  isLoading: boolean
  onReset: () => void
}

const FormActionsContext = createContext<FormActionsContextValue>({
  isDisabled: true,
  isLoading: false,
  onReset: () => {},
})

// ─── Context for passing the range picker values into the date fields ─────────
// Carries both the change-date range (dateFrom/dateTo) and the optional
// consumption-date range, since both are rendered by custom field components
// defined outside the parent and need access to the shared range state.
interface DateRangeContextValue {
  rangePickerValue: DateRangeValue | null
  onRangeChange: (value: DateRangeValue | null) => void
  rangeError: string | null
  consumptionRange: DateRangeValue | null
  onConsumptionRangeChange: (value: DateRangeValue | null) => void
  // Whether the consumption-date range is applicable for the chosen alternative.
  // When false the field is greyed out; when true it becomes required.
  consumptionEnabled: boolean
  consumptionError: string | null
}

const DateRangeContext = createContext<DateRangeContextValue>({
  rangePickerValue: null,
  onRangeChange: () => {},
  rangeError: null,
  consumptionRange: null,
  onConsumptionRangeChange: () => {},
  consumptionEnabled: false,
  consumptionError: null,
})

// ─── Context for passing the fetched alternative options into the select ──────
interface AlternativesContextValue {
  options: AlternativeOption[]
  isLoading: boolean
}

const AlternativesContext = createContext<AlternativesContextValue>({
  options: [],
  isLoading: false,
})

// ─── Submit button — full-width "apply filters" action at the panel's foot ─────
function FormActionsButtons({ isSubmitting }: SubmitButtonProps) {
  const { isDisabled, isLoading } = useContext(FormActionsContext)
  const isBusy = isSubmitting || isLoading

  return (
    <div className={styles.actions}>
      <Button type="submit" className={styles.applyButton} disabled={isBusy || isDisabled}>
        {isBusy && <Spinner size="sm" color="inline" />}
        החלת מסננים
      </Button>
    </div>
  )
}

// ─── Custom field wrapper — adds label with required indicator ────────────────
function FormFieldWrapper({ children, field, error }: FieldWrapperProps) {
  const { rangeError, consumptionEnabled, consumptionError } = useContext(DateRangeContext)
  // consumptionDateFrom is required only when the chosen alternative needs one.
  const isRequired =
    REQUIRED_FIELDS.has(field.name) || (field.name === 'consumptionDateFrom' && consumptionEnabled)
  const label = field.meta.label ?? field.label
  // For the date fields, show the live range/consumption error over any form error.
  let displayError = error
  if (field.name === 'dateFrom') displayError = rangeError ?? error
  if (field.name === 'consumptionDateFrom') displayError = consumptionError ?? error
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

function StringInput({ value, onChange, onBlur, ref }: FieldProps) {
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
function NumericInput({ value, onChange, onBlur, ref }: FieldProps) {
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

// Alternative dropdown — populated from the alternatives API via context.
function AlternativeSelect({ value, onChange, onBlur }: FieldProps) {
  const { options, isLoading } = useContext(AlternativesContext)
  const current = (value as string | undefined) ?? ''

  return (
    <SelectRoot
      items={options}
      value={current === '' ? null : current}
      onValueChange={(next: string | null) => {
        onChange(next ?? '')
        onBlur()
      }}
    >
      <SelectTrigger
        size="md"
        disabled={isLoading}
        style={{ width: '100%' }}
        placeholder={isLoading ? 'טוען…' : 'בחר חלופה'}
      >
        {(item: string) => options.find((option) => option.value === item)?.label ?? item}
      </SelectTrigger>
      <SelectList>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectList>
    </SelectRoot>
  )
}

// Range date picker — renders as the dateFrom field but controls both dates.
// It reads/writes the shared range state via DateRangeContext.
function DateRangeFieldPicker({ onChange, onBlur }: FieldProps) {
  const { rangePickerValue, onRangeChange } = useContext(DateRangeContext)

  return (
    <div className={styles.dateFieldWrapper}>
      <DatePicker
        mode="range"
        value={rangePickerValue}
        onChange={(range) => {
          onRangeChange(range)
          onChange(range?.start ?? null)
          if (range) onBlur()
        }}
      />
    </div>
  )
}

// Consumption-date range picker. Greyed out and non-interactive (via `inert`)
// when the chosen alternative doesn't support a consumption date.
function ConsumptionDateRangeFieldPicker({ onChange, onBlur }: FieldProps) {
  const { consumptionRange, onConsumptionRangeChange, consumptionEnabled } =
    useContext(DateRangeContext)

  return (
    <div
      className={clsx(styles.dateFieldWrapper, !consumptionEnabled && styles.disabledField)}
      inert={!consumptionEnabled || undefined}
    >
      <DatePicker
        mode="range"
        value={consumptionRange}
        onChange={(range) => {
          onConsumptionRangeChange(range)
          onChange(range?.start ?? undefined)
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
function MaterialChipsInput({ value, onChange, onBlur, ref }: FieldProps<string[]>) {
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
function ChangedByChipsInput({ value, onChange, onBlur, ref }: FieldProps<string[]>) {
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

// ─── Component ────────────────────────────────────────────────────────────────

export interface FoodLogsSearchFormProps {
  defaultValues: FoodLogsSearchParams
  isLoading: boolean
  /** Local change-type categories applied to the results after they arrive. */
  changeTypes: ChangeType[]
  onChangeTypesChange: (value: ChangeType[]) => void
}

export function FoodLogsSearchForm({
  defaultValues,
  isLoading,
  changeTypes,
  onChangeTypesChange,
}: FoodLogsSearchFormProps) {
  const formRef = useRef<AutoFormHandle<typeof foodLogsSearchSchema>>(null)
  const navigate = useNavigate()

  // Alternative options for the dropdown (global list, cached for the session).
  const { data: alternatives, isLoading: alternativesLoading } = useAlternatives()

  // The currently selected alternative drives the consumption-date rules.
  const [alternativeValue, setAlternativeValue] = useState(() => defaultValues.alternative)

  // Range picker local state — controls the displayed date range.
  // Both start and end are merged into the submitted data in handleSubmit.
  const [rangePickerValue, setRangePickerValue] = useState<DateRangeValue | null>(() => ({
    start: defaultValues.dateFrom,
    end: defaultValues.dateTo,
  }))

  const [rangeError, setRangeError] = useState<string | null>(null)

  // Optional consumption-date range. null means "no consumption-date filter".
  const [consumptionRange, setConsumptionRange] = useState<DateRangeValue | null>(() =>
    defaultValues.consumptionDateFrom && defaultValues.consumptionDateTo
      ? { start: defaultValues.consumptionDateFrom, end: defaultValues.consumptionDateTo }
      : null,
  )

  function validateRange(range: DateRangeValue | null): string | null {
    if (!range) return null
    const maxDate = new Date(range.start)
    maxDate.setMonth(maxDate.getMonth() + 6)
    return range.end > maxDate ? 'טווח התאריכים לא יכול לחרוג מ-6 חודשים' : null
  }

  function handleRangeChange(range: DateRangeValue | null) {
    setRangePickerValue(range)
    setRangeError(validateRange(range))
  }

  // Track whether mandatory fields are filled to control the submit button state.
  const [isMandatoryFilled, setIsMandatoryFilled] = useState(
    () => !!(defaultValues.foodBoard && defaultValues.alternative),
  )

  // Alternatives 4 & 6 ("daily") require a consumption date; all others (incl.
  // the monthly 3 & 5) can't have one, so the field is greyed out.
  const altNum = Number(alternativeValue)
  const consumptionEnabled = altNum === 4 || altNum === 6
  const consumptionError =
    consumptionEnabled && !consumptionRange ? 'יש לבחור טווח תאריכי צריכה' : null

  function handleSubmit(data: FoodLogsSearchParams) {
    const dateFrom = rangePickerValue?.start ?? data.dateFrom
    const dateTo = rangePickerValue?.end ?? data.dateTo

    if (rangeError) return
    if (consumptionEnabled && !consumptionRange) return
    void navigate({
      to: '/food-logs',
      search: {
        ...data,
        dateFrom,
        dateTo,
        consumptionDateFrom: consumptionEnabled ? consumptionRange?.start : undefined,
        consumptionDateTo: consumptionEnabled ? consumptionRange?.end : undefined,
      },
    })
  }

  function handleReset() {
    const yesterday = new Date(Date.now() - 864e5)
    const today = new Date()
    setRangePickerValue({ start: yesterday, end: today })
    setRangeError(null)
    setConsumptionRange(null)
    setAlternativeValue('')
    formRef.current?.reset({
      foodBoard: '',
      alternative: '',
      dateFrom: yesterday,
      dateTo: today,
      material: undefined,
      consumptionDateFrom: undefined,
      consumptionDateTo: undefined,
      changedBy: undefined,
    })
    setIsMandatoryFilled(false)
    // Reselect every change-type category so the default is "show everything".
    onChangeTypesChange(ALL_CHANGE_TYPES)
    // Clear the URL search params too. The table is driven by the URL, so this
    // empties the results, and a later refresh won't repopulate stale fields.
    void navigate({ to: '/food-logs', search: foodLogsSearchSchema.parse({}) })
  }

  const contextValue: FormActionsContextValue = {
    isDisabled:
      !isMandatoryFilled ||
      !rangePickerValue ||
      rangeError !== null ||
      (consumptionEnabled && !consumptionRange),
    isLoading,
    onReset: handleReset,
  }

  const dateRangeContextValue: DateRangeContextValue = {
    rangePickerValue,
    onRangeChange: handleRangeChange,
    rangeError,
    consumptionRange,
    onConsumptionRangeChange: setConsumptionRange,
    consumptionEnabled,
    consumptionError,
  }

  const alternativesContextValue: AlternativesContextValue = {
    options: alternatives ?? [],
    isLoading: alternativesLoading,
  }

  return (
    <FormActionsContext.Provider value={contextValue}>
      <DateRangeContext.Provider value={dateRangeContextValue}>
        <AlternativesContext.Provider value={alternativesContextValue}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>
                <Filter size="1rem" aria-hidden />
                מסננים
              </span>
              <Button type="button" variant="link" size="sm" onClick={handleReset}>
                איפוס הכל
              </Button>
            </div>
            <AutoForm
              ref={formRef}
              form={searchForm}
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              fieldWrapper={FormFieldWrapper}
              components={{ string: StringInput }}
              fields={{
                foodBoard: { label: 'לוח מזון', component: NumericInput },
                alternative: { label: 'חלופה', component: AlternativeSelect },
                dateFrom: { label: 'טווח תאריכי שינוי', component: DateRangeFieldPicker },
                dateTo: { hidden: true },
                material: { label: 'חומר', component: MaterialChipsInput },
                consumptionDateFrom: {
                  label: 'טווח תאריכי צריכה',
                  component: ConsumptionDateRangeFieldPicker,
                },
                consumptionDateTo: { hidden: true },
                changedBy: { label: 'שונה ע"י', component: ChangedByChipsInput },
              }}
              layout={{
                submitButton: FormActionsButtons,
              }}
              classNames={{ form: styles.form! }}
              onValuesChange={(vals) => {
                setIsMandatoryFilled(!!(vals.foodBoard && vals.alternative))
                const alt = vals.alternative
                setAlternativeValue(alt)
                // Clear any consumption range when the alternative can't have one.
                const num = Number(alt)
                if (num !== 4 && num !== 6) {
                  setConsumptionRange((prev) => (prev ? null : prev))
                }
              }}
            />
            <div className={styles.changeTypeFilter}>
              <span className={styles.changeTypeLabel}>סוג שינוי</span>
              <div className={styles.checkboxGroup}>
                {CHANGE_TYPE_OPTIONS.map((option) => {
                  const checked = changeTypes.includes(option.value)
                  // Keep at least one category selected: the last remaining
                  // checkbox can't be unticked.
                  const isLastChecked = checked && changeTypes.length === 1
                  return (
                    <Checkbox
                      key={option.value}
                      size="sm"
                      label={option.label}
                      checked={checked}
                      disabled={isLastChecked}
                      onCheckedChange={(next) => {
                        if (next) {
                          onChangeTypesChange([...changeTypes, option.value])
                        } else if (changeTypes.length > 1) {
                          onChangeTypesChange(changeTypes.filter((t) => t !== option.value))
                        }
                      }}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </AlternativesContext.Provider>
      </DateRangeContext.Provider>
    </FormActionsContext.Provider>
  )
}
