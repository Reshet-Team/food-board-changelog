import clsx from 'clsx'
import styles from './Empty.module.scss'

export type EmptyMediaVariant = 'default' | 'icon'

export type EmptyProps = React.HTMLAttributes<HTMLDivElement>

export function Empty({ className, ...props }: EmptyProps) {
  return <div className={clsx(styles.root, className)} {...props} />
}

export type EmptyHeaderProps = React.HTMLAttributes<HTMLDivElement>

export function EmptyHeader({ className, ...props }: EmptyHeaderProps) {
  return <div className={clsx(styles.header, className)} {...props} />
}

export interface EmptyMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: EmptyMediaVariant
}

export function EmptyMedia({ variant = 'default', className, ...props }: EmptyMediaProps) {
  return <div className={clsx(styles.media, className)} data-variant={variant} {...props} />
}

export type EmptyTitleProps = React.HTMLAttributes<HTMLHeadingElement>

export function EmptyTitle({ className, ...props }: EmptyTitleProps) {
  return <h3 className={clsx(styles.title, className)} {...props} />
}

export type EmptyDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

export function EmptyDescription({ className, ...props }: EmptyDescriptionProps) {
  return <p className={clsx(styles.description, className)} {...props} />
}

export type EmptyContentProps = React.HTMLAttributes<HTMLDivElement>

export function EmptyContent({ className, ...props }: EmptyContentProps) {
  return <div className={clsx(styles.content, className)} {...props} />
}
