import { useResizeObserver } from '@/hooks/useResizeObserver'
import clsx from 'clsx'
import { useRef, useState, type HTMLAttributes, type ReactNode } from 'react'
import styles from './Container.module.scss'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

function Container({ children, className, ...props }: ContainerProps) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>(undefined)

  useResizeObserver(innerRef, () => {
    const el = innerRef.current
    if (el) setHeight(el.getBoundingClientRect().height)
  })

  return (
    <div
      {...props}
      className={clsx(styles.animatedWrapper, className)}
      style={{ height: height ?? 'auto', ...props.style }}
    >
      <div ref={innerRef}>{children}</div>
    </div>
  )
}

export default Container
