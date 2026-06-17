import clsx from 'clsx'
import { LoaderCircle } from 'lucide-react'
import type { HTMLAttributes } from 'react'
import styles from './Spinner.module.scss'

export type SpinnerSize = 'sm' | 'md' | 'lg'
export type SpinnerColor = 'primary' | 'neutral' | 'danger' | 'inline'

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize
  color?: SpinnerColor
  className?: string
}

export function Spinner({ size = 'md', color = 'primary', className, ...props }: SpinnerProps) {
  return (
    <span
      aria-label="Loading"
      role="status"
      {...props}
      className={clsx(styles.spinner, className)}
      data-size={size}
      data-color={color}
    >
      <LoaderCircle aria-hidden className={styles.icon} />
    </span>
  )
}
