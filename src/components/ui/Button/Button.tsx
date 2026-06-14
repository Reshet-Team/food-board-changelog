import { Button as BaseButton } from '@base-ui/react/button'
import clsx from 'clsx'
import styles from './Button.module.scss'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'clear'
  | 'link'
export type ButtonSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'icon-xs'
  | 'icon-sm'
  | 'icon'
  | 'icon-lg'

export interface ButtonProps extends BaseButton.Props {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      className={clsx(styles.button, className)}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </BaseButton>
  )
}
