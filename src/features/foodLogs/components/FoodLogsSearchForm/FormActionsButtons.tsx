import { Button } from '@/components/ui/Button/Button'
import { Checkbox } from '@/components/ui/Checkbox/Checkbox'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { FormActionsContext } from '@/features/foodLogs/components/FoodLogsSearchForm/searchFormContext'
import { CHANGE_TYPE_OPTIONS } from '@/features/foodLogs/utils/changeType'
import type { SubmitButtonProps } from '@uniform-ts/core'
import { useContext } from 'react'
import styles from './FoodLogsSearchForm.module.scss'

// ─── Submit button — change-type filter + full-width "apply filters" action ───
// Rendered as the form's submit slot so the change-type checkboxes sit inside
// the same filters block as the other fields, right above the apply button.
export function FormActionsButtons({ isSubmitting }: SubmitButtonProps) {
  const { isDisabled, isLoading, changeTypes, onChangeTypesChange } = useContext(FormActionsContext)
  const isBusy = isSubmitting || isLoading

  return (
    <>
      <div className={styles.changeTypeFilter}>
        <span className={styles.changeTypeLabel}>סוג שינוי</span>
        <div className={styles.checkboxGroup}>
          {CHANGE_TYPE_OPTIONS.map((option) => {
            const checked = changeTypes.includes(option.value)
            // Keep at least one category selected: the last remaining checkbox
            // can't be unticked.
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
      <div className={styles.actions}>
        <Button type="submit" className={styles.applyButton} disabled={isBusy || isDisabled}>
          {isBusy && <Spinner size="sm" color="inline" />}
          החלת מסננים
        </Button>
      </div>
    </>
  )
}
