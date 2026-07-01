import { Button } from '@/components/ui/Button/Button'
import { Checkbox } from '@/components/ui/Checkbox/Checkbox'
import { Spinner } from '@/components/ui/Spinner/Spinner'
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
import {
  ALL_CHANGE_TYPES,
  CHANGE_TYPE_OPTIONS,
  type ChangeType,
} from '@/features/foodLogs/utils/changeType'
import type { AutoFormHandle } from '@uniform-ts/core'
import { AutoForm, createForm } from '@uniform-ts/core'
import { useSetAtom } from 'jotai'
import { Filter } from 'lucide-react'
import { useRef, useState } from 'react'
import styles from './FoodLogsSearchForm.module.scss'
import { isDailyAlternative, validateDateRange } from './searchRules'

const searchForm = createForm(foodLogsSearchSchema)

export interface FoodLogsSearchFormProps {
  defaultValues: FoodLogsSearchParams
  isLoading: boolean

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

  const { data: alternatives } = useAlternatives()

  const [values, setValues] = useState<FoodLogsSearchParams>(defaultValues)

  const consumptionEnabled = isDailyAlternative(values.alternative, alternatives ?? [])
  const rangeError = validateDateRange(values.dateFrom, values.dateTo)
  const consumptionMissing =
    consumptionEnabled && !(values.consumptionDateFrom && values.consumptionDateTo)

  const isDisabled =
    !(values.foodBoard && values.alternative) || rangeError !== null || consumptionMissing

  function handleSubmit(data: FoodLogsSearchParams) {
    if (validateDateRange(data.dateFrom, data.dateTo)) return
    const daily = isDailyAlternative(data.alternative, alternatives ?? [])
    if (daily && !(data.consumptionDateFrom && data.consumptionDateTo)) return
    setFilter({
      ...data,

      consumptionDateFrom: daily ? data.consumptionDateFrom : undefined,
      consumptionDateTo: daily ? data.consumptionDateTo : undefined,
    })
  }

  function handleReset() {
    const yesterday = new Date(Date.now() - 864e5)
    const today = new Date()
    const next: FoodLogsSearchParams = {
      foodBoard: '',
      alternative: '',
      dateFrom: yesterday,
      dateTo: today,
      material: undefined,
      consumptionDateFrom: undefined,
      consumptionDateTo: undefined,
      changedBy: undefined,
    }
    formRef.current?.reset(next)
    setValues(next)

    onChangeTypesChange(ALL_CHANGE_TYPES)

    setFilter(defaultFoodLogsFilter)
  }

  return (
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

      <div className={styles.scrollArea}>
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
          layout={{ submitButton: null }}
          classNames={{ form: styles.form! }}
          onValuesChange={(vals) => {
            setValues(vals)

            if (
              !isDailyAlternative(vals.alternative, alternatives ?? []) &&
              (vals.consumptionDateFrom || vals.consumptionDateTo)
            ) {
              formRef.current?.setValues({
                consumptionDateFrom: undefined,
                consumptionDateTo: undefined,
              })
            }
          }}
        />

        <div className={styles.changeTypeFilter}>
          <span className={styles.changeTypeLabel}>סוג שינוי</span>
          <div className={styles.checkboxGroup}>
            {CHANGE_TYPE_OPTIONS.map((option) => {
              const checked = changeTypes.includes(option.value)

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

      <div className={styles.footer}>
        <Button
          type="button"
          className={styles.applyButton}
          disabled={isDisabled || isLoading}
          onClick={() => formRef.current?.submit()}
        >
          {isLoading && <Spinner size="sm" color="inline" />}
          החלת מסננים
        </Button>
      </div>
    </div>
  )
}
