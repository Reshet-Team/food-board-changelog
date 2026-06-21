import { Button } from '@/components/ui/Button/Button'
import type { DateRangeValue } from '@/components/ui/DatePicker/DatePicker'
import DatePicker from '@/components/ui/DatePicker/DatePicker'
import { FieldLabel, FieldRoot } from '@/components/ui/Field/Field'
import { Input } from '@/components/ui/Input/Input'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import type { FoodLogsSearchParams } from '@/features/foodLogs/types/foodLog'
import { foodLogsSearchSchema } from '@/features/foodLogs/types/foodLog'
import { useNavigate } from '@tanstack/react-router'
import type {
  AutoFormHandle,
  FieldProps,
  FieldWrapperProps,
  SubmitButtonProps,
} from '@uniform-ts/core'
import { AutoForm, createForm } from '@uniform-ts/core'
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

// ─── Context for passing the range picker value into the dateFrom field ───────
interface DateRangeContextValue {
  rangePickerValue: DateRangeValue | null
  onRangeChange: (value: DateRangeValue | null) => void
  rangeError: string | null
}

const DateRangeContext = createContext<DateRangeContextValue>({
  rangePickerValue: null,
  onRangeChange: () => {},
  rangeError: null,
})

// ─── Submit + Reset buttons ───────────────────────────────────────────────────
function FormActionsButtons({ isSubmitting }: SubmitButtonProps) {
  const { isDisabled, isLoading, onReset } = useContext(FormActionsContext)
  const isBusy = isSubmitting || isLoading

  return (
    <div className={styles.actions}>
      <Button type="submit" disabled={isBusy || isDisabled}>
        {isBusy && <Spinner size="sm" color="inline" />}
        חפש
      </Button>
      <Button type="button" variant="secondary" onClick={onReset}>
        איפוס
      </Button>
    </div>
  )
}

// ─── Custom field wrapper — adds label with required indicator ────────────────
function FormFieldWrapper({ children, field, error }: FieldWrapperProps) {
  const { rangeError } = useContext(DateRangeContext)
  const isRequired = REQUIRED_FIELDS.has(field.name)
  const label = field.meta.label ?? field.label
  // For the dateFrom field, show the live range error in preference to any form error.
  const displayError = field.name === 'dateFrom' ? (rangeError ?? error) : error
  // The date range holds two dates + an icon, so it spans two grid tracks.
  // Using a class (not an inline style) lets media queries adjust it on small screens.
  const className = field.name === 'dateFrom' ? styles.dateRangeField : undefined
  return (
    <FieldRoot className={className}>
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

// Same as NumericInput but capped at 2 characters (for `alternative`).
function TwoDigitNumericInput({ value, onChange, onBlur, ref }: FieldProps) {
  return (
    <Input
      ref={ref as React.Ref<HTMLInputElement>}
      inputMode="numeric"
      maxLength={2}
      value={(value as string | undefined) ?? ''}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 2)
        onChange(digits)
      }}
      onBlur={onBlur}
    />
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

// Single date picker — used for consumptionDate
function DateFieldPicker({ value, onChange, onBlur }: FieldProps) {
  return (
    <div className={styles.dateFieldWrapper}>
      <DatePicker
        mode="single"
        value={(value as Date | null | undefined) ?? null}
        onChange={(v: Date | null) => {
          onChange(v)
          onBlur()
        }}
      />
    </div>
  )
}

// Time input: the form stores HHMMSS ("143000"), but <input type="time"> uses HH:MM.
// We convert on every read and write.
function TimeInput({ value, onChange, onBlur, ref }: FieldProps) {
  const strValue = (value as string | undefined) ?? ''
  const displayValue = strValue ? `${strValue.slice(0, 2)}:${strValue.slice(2, 4)}` : ''

  return (
    <Input
      ref={ref as React.Ref<HTMLInputElement>}
      type="time"
      value={displayValue}
      onBlur={onBlur}
      onChange={(e) => {
        const hhmm = e.target.value // "HH:MM" or ""
        if (!hhmm) {
          onChange('')
          return
        }
        // "14:30" → "14:30:00" → strip colons → "143000"
        onChange((hhmm + ':00').replace(/:/g, ''))
      }}
    />
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface FoodLogsSearchFormProps {
  defaultValues: FoodLogsSearchParams
  isLoading: boolean
}

export function FoodLogsSearchForm({ defaultValues, isLoading }: FoodLogsSearchFormProps) {
  const formRef = useRef<AutoFormHandle<typeof foodLogsSearchSchema>>(null)
  const navigate = useNavigate()

  // Range picker local state — controls the displayed date range.
  // Both start and end are merged into the submitted data in handleSubmit.
  const [rangePickerValue, setRangePickerValue] = useState<DateRangeValue | null>(() => ({
    start: defaultValues.dateFrom,
    end: defaultValues.dateTo,
  }))

  const [rangeError, setRangeError] = useState<string | null>(null)

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

  function handleSubmit(data: FoodLogsSearchParams) {
    const dateFrom = rangePickerValue?.start ?? data.dateFrom
    const dateTo = rangePickerValue?.end ?? data.dateTo

    if (rangeError) return
    void navigate({ to: '/food-logs', search: { ...data, dateFrom, dateTo } })
  }

  function handleReset() {
    const yesterday = new Date(Date.now() - 864e5)
    const today = new Date()
    setRangePickerValue({ start: yesterday, end: today })
    setRangeError(null)
    formRef.current?.reset({
      foodBoard: '',
      alternative: '',
      dateFrom: yesterday,
      dateTo: today,
      material: '',
      consumptionDate: undefined,
      changeTime: '',
      changedBy: '',
    })
    setIsMandatoryFilled(false)
    // Clear the URL search params too. The table is driven by the URL, so this
    // empties the results, and a later refresh won't repopulate stale fields.
    void navigate({ to: '/food-logs', search: foodLogsSearchSchema.parse({}) })
  }

  const contextValue: FormActionsContextValue = {
    isDisabled: !isMandatoryFilled || !rangePickerValue || rangeError !== null,
    isLoading,
    onReset: handleReset,
  }

  const dateRangeContextValue: DateRangeContextValue = {
    rangePickerValue,
    onRangeChange: handleRangeChange,
    rangeError,
  }

  return (
    <FormActionsContext.Provider value={contextValue}>
      <DateRangeContext.Provider value={dateRangeContextValue}>
        <AutoForm
          ref={formRef}
          form={searchForm}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          fieldWrapper={FormFieldWrapper}
          components={{ string: StringInput, date: DateFieldPicker }}
          fields={{
            foodBoard: { label: 'לוח מזון', component: NumericInput },
            alternative: { label: 'חלופה', component: TwoDigitNumericInput },
            dateFrom: { label: 'טווח תאריכי שינוי', component: DateRangeFieldPicker },
            dateTo: { hidden: true },
            material: { label: 'חומר', component: NumericInput },
            consumptionDate: { label: 'תאריך צריכה' },
            changeTime: { label: 'שעת שינוי', component: TimeInput },
            changedBy: { label: 'שונה ע"י' },
          }}
          layout={{
            submitButton: FormActionsButtons,
          }}
          classNames={{ form: styles.form! }}
          onValuesChange={(vals) => {
            setIsMandatoryFilled(!!(vals.foodBoard && vals.alternative))
          }}
        />
      </DateRangeContext.Provider>
    </FormActionsContext.Provider>
  )
}
