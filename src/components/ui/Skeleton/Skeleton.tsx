import clsx from 'clsx'
import styles from './Skeleton.module.scss'

export type SkeletonShape = 'rectangle' | 'circle' | 'text'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: SkeletonShape
}

export function Skeleton({ shape = 'rectangle', className, ...props }: SkeletonProps) {
  return <div className={clsx(styles.root, className)} data-shape={shape} {...props} />
}
