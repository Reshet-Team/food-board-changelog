'use no memo' // TanStack Table doesn't support the React Compiler yet

import { TooltipContent, TooltipRoot, TooltipTrigger } from '@/components/ui/Tooltip/Tooltip'
import { changeTypeLabel, classifyChangeType } from '@/features/foodLogs/utils/changeType'
import { useResizeObserver } from '@/hooks/useResizeObserver'
import clsx from 'clsx'
import { ArrowLeft } from 'lucide-react'
import { useRef, useState } from 'react'
import styles from './FoodLogsTable.module.scss'

// ─── Change-type badge ───────────────────────────────────────────────────────
// Translates the raw SAP indicator code (U / E / D / I / J) into a Hebrew label
// and colours the pill by category: add → green, delete → red, update → amber.
export function ChangeTypeBadge({ code }: { code: string }) {
  return (
    <span className={styles.badge} data-tone={classifyChangeType(code)}>
      {changeTypeLabel(code)}
    </span>
  )
}

// ─── Clip detection ──────────────────────────────────────────────────────────
// Only a single unbroken token (an 18-digit material number, a username) is
// clipped with an ellipsis; a value containing a space is allowed to wrap onto
// the next line instead. This hook watches the rendered width and reports
// whether a single-token value actually overflows its cell. Column widths are
// responsive, so it re-measures whenever the cell is resized.
function useClip(value: string) {
  const ref = useRef<HTMLSpanElement>(null)
  const [isClipped, setIsClipped] = useState(false)

  const trimmed = value.trim()
  const isSingleToken = trimmed.length > 0 && !/\s/.test(trimmed)

  // Re-measure on mount, on resize, and whenever the value (and therefore the
  // single-token check) changes. A multi-token value is allowed to wrap, so it
  // is never reported as clipped.
  useResizeObserver(ref, () => {
    const el = ref.current
    setIsClipped(!!el && isSingleToken && el.scrollWidth > el.clientWidth)
  }, [value, isSingleToken])

  return { ref, isClipped, isSingleToken }
}

// ─── Text cell ───────────────────────────────────────────────────────────────
// Renders a single value. A value with no spaces (e.g. a long number) stays on
// one line and truncates with an ellipsis — the full text shows in the tooltip
// on hover; a value with spaces wraps onto new lines between words. The Reshet
// tooltip is always mounted so the measured span never remounts; it only opens
// (`disabled={!isClipped}`) when the value actually overflows.
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

// ─── Value change ────────────────────────────────────────────────────────────
// Shows an update as the old value (red) and new value (green) with an arrow
// between them. They sit side by side on one line while they fit, and only wrap
// onto a new line when the pair is too wide for the column. Each value reuses
// `TextCell`, so a long number truncates (with a hover tooltip) while free text
// wraps.
export function ValueChange({ oldValue, newValue }: { oldValue: string; newValue: string }) {
  return (
    <span className={styles.valueChange}>
      <TextCell value={oldValue} className={styles.oldValue} />
      <ArrowLeft className={styles.valueArrow} size="0.85rem" aria-hidden />
      <TextCell value={newValue} className={styles.newValue} />
    </span>
  )
}
