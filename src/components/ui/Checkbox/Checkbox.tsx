import { type SlotProps } from '@/lib/styleUtilities'
import type { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import clsx from 'clsx'
import { Check, Minus } from 'lucide-react'
import React from 'react'
import styles from './Checkbox.module.scss'
import { CheckboxIndicator, CheckboxRoot } from './primitives'

export type CheckboxSize = 'sm' | 'md' | 'lg'

export interface CheckboxProps
  extends Omit<BaseCheckbox.Root.Props, 'children'>, SlotProps<typeof BaseCheckbox, 'indicator'> {
  size?: CheckboxSize
  label?: React.ReactNode
  description?: React.ReactNode
  wrapperProps?: React.ComponentProps<'label'>
}

export function Checkbox({
  size = 'md',
  label,
  description,
  wrapperProps,
  indicatorProps,
  indeterminate,
  ...props
}: CheckboxProps) {
  const control = (
    <CheckboxRoot data-size={size} indeterminate={indeterminate} {...props}>
      <CheckboxIndicator keepMounted {...indicatorProps}>
        {indeterminate ? <Minus aria-hidden /> : <Check aria-hidden />}
      </CheckboxIndicator>
    </CheckboxRoot>
  )

  if (!label) return control

  return (
    <label {...wrapperProps} className={clsx(styles.wrapper, wrapperProps?.className)}>
      {control}
      {description ? (
        <div className={styles.labelContent}>
          <span className={styles.label}>{label}</span>
          <span className={styles.description}>{description}</span>
        </div>
      ) : (
        <span className={styles.label}>{label}</span>
      )}
    </label>
  )
}
