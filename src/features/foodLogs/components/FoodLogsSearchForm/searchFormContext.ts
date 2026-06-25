import type { DateRangeValue } from '@/components/ui/DatePicker/DatePicker'
import type { AlternativeOption } from '@/features/foodLogs/types/foodLog'
import type { ChangeType } from '@/features/foodLogs/utils/changeType'
import { createContext } from 'react'

// These contexts let the custom field/button slot components — which must be
// declared outside the parent component to keep stable references — read the
// shared form state without prop drilling. The parent renders the providers and
// each slot component consumes the slice it needs.

// ─── Context for passing button state into the submit button slot ─────────────
export interface FormActionsContextValue {
  isDisabled: boolean
  isLoading: boolean
  onReset: () => void
  // Local change-type filter, rendered just above the apply button.
  changeTypes: ChangeType[]
  onChangeTypesChange: (value: ChangeType[]) => void
}

export const FormActionsContext = createContext<FormActionsContextValue>({
  isDisabled: true,
  isLoading: false,
  onReset: () => {},
  changeTypes: [],
  onChangeTypesChange: () => {},
})

// ─── Context for passing the range picker values into the date fields ─────────
// Carries both the change-date range (dateFrom/dateTo) and the optional
// consumption-date range, since both are rendered by custom field components
// defined outside the parent and need access to the shared range state.
export interface DateRangeContextValue {
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

export const DateRangeContext = createContext<DateRangeContextValue>({
  rangePickerValue: null,
  onRangeChange: () => {},
  rangeError: null,
  consumptionRange: null,
  onConsumptionRangeChange: () => {},
  consumptionEnabled: false,
  consumptionError: null,
})

// ─── Context for passing the fetched alternative options into the select ──────
export interface AlternativesContextValue {
  options: AlternativeOption[]
  isLoading: boolean
}

export const AlternativesContext = createContext<AlternativesContextValue>({
  options: [],
  isLoading: false,
})
