'use no memo'

import { TooltipContent, TooltipRoot, TooltipTrigger } from '@/components/ui/Tooltip/Tooltip'
import { changeTypeLabel, classifyChangeType } from '@/features/foodLogs/utils/changeType'
import { useResizeObserver } from '@/hooks/useResizeObserver'
import clsx from 'clsx'
import { ArrowLeft } from 'lucide-react'
import { useRef, useState } from 'react'
import styles from './FoodLogsTable.module.scss'

export function ChangeTypeBadge({ code }: { code: string }) {
  return (
    <span className={styles.badge} data-tone={classifyChangeType(code)}>
      {changeTypeLabel(code)}
    </span>
  )
}

function useClip(value: string) {
  const ref = useRef<HTMLSpanElement>(null)
  const [isClipped, setIsClipped] = useState(false)

  const trimmed = value.trim()
  const isSingleToken = trimmed.length > 0 && !/\s/.test(trimmed)

  useResizeObserver(ref, () => {
    const el = ref.current
    setIsClipped(!!el && isSingleToken && el.scrollWidth > el.clientWidth)
  }, [value, isSingleToken])

  return { ref, isClipped, isSingleToken }
}

export function TextCell({ value, className }: { value: string; className?: string | undefined }) {
  const { ref, isClipped, isSingleToken } = useClip(value)
  const label = (
    <span ref={ref} className={clsx(isSingleToken ? styles.truncate : styles.wrap, className)}>
      {value}
    </span>
  )
  if (!isClipped) return label
  return (
    <TooltipRoot>
      <TooltipTrigger render={label} />
      <TooltipContent>{value}</TooltipContent>
    </TooltipRoot>
  )
}

export function ValueChange({ oldValue, newValue }: { oldValue: string; newValue: string }) {
  return (
    <span className={styles.valueChange}>
      <TextCell value={oldValue} className={styles.oldValue} />
      <ArrowLeft className={styles.valueArrow} size="0.85rem" aria-hidden />
      <TextCell value={newValue} className={styles.newValue} />
    </span>
  )
}
