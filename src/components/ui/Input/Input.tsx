import { Input as BaseInput } from '@base-ui/react/input'
import clsx from 'clsx'
import styles from './Input.module.scss'

export type InputSize = 'sm' | 'md' | 'lg'

export interface InputProps extends Omit<BaseInput.Props, 'size'> {
  size?: InputSize
  startSlot?: React.ReactNode
  endSlot?: React.ReactNode
}

export function Input({
  size = 'md',
  startSlot,
  endSlot,
  className,
  ...props
}: InputProps) {
  return (
    <div className={clsx(styles.wrapper, className)} data-size={size}>
      {startSlot && <div className={styles.startSlot}>{startSlot}</div>}
      <BaseInput className={styles.input} {...props} />
      {endSlot && <div className={styles.endSlot}>{endSlot}</div>}
    </div>
  )
}
