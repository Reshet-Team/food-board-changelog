import clsx from 'clsx'
import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react'
import styles from './Container.module.scss'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

function Container({ children, className, ...props }: ContainerProps) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      setHeight(el.getBoundingClientRect().height)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

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
