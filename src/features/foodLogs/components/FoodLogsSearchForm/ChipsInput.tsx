import { Input } from '@/components/ui/Input/Input'
import type { FieldProps } from '@uniform-ts/core'
import { X } from 'lucide-react'
import { useState } from 'react'
import styles from './FoodLogsSearchForm.module.scss'

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
