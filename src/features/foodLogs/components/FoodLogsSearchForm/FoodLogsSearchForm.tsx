import { Button } from '@/components/ui/Button/Button'
import type { DateRangeValue } from '@/components/ui/DatePicker/DatePicker'
import { FormActionsButtons } from '@/features/foodLogs/components/FoodLogsSearchForm/FormActionsButtons'
import {
  AlternativesContext,
  DateRangeContext,
  FormActionsContext,
  type AlternativesContextValue,
  type DateRangeContextValue,
  type FormActionsContextValue,
} from '@/features/foodLogs/components/FoodLogsSearchForm/searchFormContext'
import {
  AlternativeSelect,
  ChangedByChipsInput,
  ConsumptionDateRangeFieldPicker,
  DateRangeFieldPicker,
  FormFieldWrapper,
  MaterialChipsInput,
  NumericInput,
  StringInput,
} from '@/features/foodLogs/components/FoodLogsSearchForm/SearchFormFields'
import { useAlternatives } from '@/features/foodLogs/hooks/useAlternatives'
import { defaultFoodLogsFilter, foodLogsFilterAtom } from '@/features/foodLogs/store/filterAtom'
import type { FoodLogsSearchParams } from '@/features/foodLogs/types/foodLog'
import { foodLogsSearchSchema } from '@/features/foodLogs/types/foodLog'
import { ALL_CHANGE_TYPES, type ChangeType } from '@/features/foodLogs/utils/changeType'
import type { AutoFormHandle } from '@uniform-ts/core'
import { AutoForm, createForm } from '@uniform-ts/core'
import { useSetAtom } from 'jotai'
import { Filter } from 'lucide-react'
import { useRef, useState } from 'react'
import { isDailyAlternative } from './dailyAlternative'
import styles from './FoodLogsSearchForm.module.scss'

// ─── UniForm definition (created once, outside the component) ────────────────
const searchForm = createForm(foodLogsSearchSchema)

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
  const setFilter = useSetAtom(foodLogsFilterAtom)

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

  // "Daily" alternatives require a consumption date; all others can't have one,
  // so the field is greyed out. Determined by the alternative's description.
  const consumptionEnabled = isDailyAlternative(alternativeValue, alternatives ?? [])
  const consumptionError =
    consumptionEnabled && !consumptionRange ? 'יש לבחור טווח תאריכי צריכה' : null

  function handleSubmit(data: FoodLogsSearchParams) {
    const dateFrom = rangePickerValue?.start ?? data.dateFrom
    const dateTo = rangePickerValue?.end ?? data.dateTo

    if (rangeError) return
    if (consumptionEnabled && !consumptionRange) return
    setFilter({
      ...data,
      dateFrom,
      dateTo,
      consumptionDateFrom: consumptionEnabled ? consumptionRange?.start : undefined,
      consumptionDateTo: consumptionEnabled ? consumptionRange?.end : undefined,
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
    // Clear the filter atom too. The table is driven by the atom, so this
    // empties the results back to the idle state.
    setFilter(defaultFoodLogsFilter)
  }

  const contextValue: FormActionsContextValue = {
    isDisabled:
      !isMandatoryFilled ||
      !rangePickerValue ||
      rangeError !== null ||
      (consumptionEnabled && !consumptionRange),
    isLoading,
    onReset: handleReset,
    changeTypes,
    onChangeTypesChange,
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
                if (!isDailyAlternative(alt, alternatives ?? [])) {
                  setConsumptionRange((prev) => (prev ? null : prev))
                }
              }}
            />
          </div>
        </AlternativesContext.Provider>
      </DateRangeContext.Provider>
    </FormActionsContext.Provider>
  )
}
