import { createCalendar, type CalendarDate, type DateValue } from '@internationalized/date'
import clsx from 'clsx'
import { useRef, useState } from 'react'
import {
  useDateField,
  useDateRangePicker,
  useDateSegment,
  type AriaDateFieldProps,
  type AriaDateRangePickerProps,
} from 'react-aria'
import {
  useDateFieldState,
  useDateRangePickerState,
  type DateFieldState,
  type DateSegment,
} from 'react-stately'
import styles from './DateInput.module.scss'

// ─── Segment ────────────────────────────────────────────────────────────────

function Segment({ segment, state }: { segment: DateSegment; state: DateFieldState }) {
  const ref = useRef<HTMLSpanElement>(null)
  const { segmentProps } = useDateSegment(segment, state, ref)
  const [yearBuffer, setYearBuffer] = useState('')

  const isYear = segment.type === 'year'

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (isYear && /^[0-9]$/.test(e.key)) {
      e.preventDefault()
      const next = yearBuffer + e.key
      if (next.length === 4) {
        state.setSegment('year', parseInt(next, 10))
        setYearBuffer('')
      } else {
        setYearBuffer(next)
      }
    } else {
      if (isYear && yearBuffer) setYearBuffer('')
      segmentProps.onKeyDown?.(e as React.KeyboardEvent<HTMLDivElement>)
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLSpanElement>) => {
    if (isYear) setYearBuffer('')
    segmentProps.onFocus?.(e as React.FocusEvent<HTMLDivElement>)
  }

  const handleBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    if (isYear && yearBuffer) setYearBuffer('')
    segmentProps.onBlur?.(e as React.FocusEvent<HTMLDivElement>)
  }

  return (
    <span
      {...segmentProps}
      ref={ref}
      className={styles.segment}
      data-placeholder={segment.isPlaceholder || undefined}
      data-type={segment.type}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {isYear && yearBuffer ? yearBuffer : segment.text}
    </span>
  )
}

// ─── Single field ────────────────────────────────────────────────────────────

type SingleFieldProps = AriaDateFieldProps<CalendarDate> & {
  className?: string
  iconSpacing?: boolean
  locale?: string
}

function SingleField({
  className,
  iconSpacing,
  locale = navigator.language,
  ...props
}: SingleFieldProps) {
  const state = useDateFieldState({ ...props, locale, createCalendar })
  const ref = useRef<HTMLDivElement>(null)
  const { fieldProps } = useDateField(props, state, ref)

  return (
    <div
      {...fieldProps}
      ref={ref}
      className={clsx(styles.field, iconSpacing && styles.fieldIconSpace, className)}
      data-invalid={state.isInvalid || undefined}
      data-disabled={props.isDisabled || undefined}
    >
      {state.segments.map((seg, i) => (
        <Segment key={i} segment={seg} state={state} />
      ))}
    </div>
  )
}

// ─── Range field ─────────────────────────────────────────────────────────────

type RangeFieldProps = AriaDateRangePickerProps<DateValue> & {
  className?: string
  iconSpacing?: boolean
  locale?: string
}

function RangeField({
  className,
  iconSpacing,
  locale = navigator.language,
  ...props
}: RangeFieldProps) {
  const groupRef = useRef<HTMLDivElement>(null)
  const startRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  const rangeState = useDateRangePickerState(props)
  const { groupProps, startFieldProps, endFieldProps } = useDateRangePicker(
    props,
    rangeState,
    groupRef,
  )

  const startState = useDateFieldState({
    ...(startFieldProps as AriaDateFieldProps<CalendarDate>),
    locale,
    createCalendar,
  })
  const endState = useDateFieldState({
    ...(endFieldProps as AriaDateFieldProps<CalendarDate>),
    locale,
    createCalendar,
  })

  const { fieldProps: startField } = useDateField(
    startFieldProps as AriaDateFieldProps<CalendarDate>,
    startState,
    startRef,
  )
  const { fieldProps: endField } = useDateField(
    endFieldProps as AriaDateFieldProps<CalendarDate>,
    endState,
    endRef,
  )

  return (
    <div {...groupProps} ref={groupRef} className={clsx(styles.rangeWrapper, className)}>
      <div
        {...startField}
        ref={startRef}
        className={styles.field}
        data-invalid={rangeState.isInvalid || undefined}
        data-disabled={props.isDisabled || undefined}
      >
        {startState.segments.map((seg, i) => (
          <Segment key={i} segment={seg} state={startState} />
        ))}
      </div>
      <span className={styles.rangeSeparator} aria-hidden="true">
        –
      </span>
      <div
        {...endField}
        ref={endRef}
        className={clsx(styles.field, iconSpacing && styles.fieldIconSpace)}
        data-invalid={rangeState.isInvalid || undefined}
        data-disabled={props.isDisabled || undefined}
      >
        {endState.segments.map((seg, i) => (
          <Segment key={i} segment={seg} state={endState} />
        ))}
      </div>
    </div>
  )
}

// ─── Range inline field ───────────────────────────────────────────────────────

function RangeInlineField({
  className,
  iconSpacing,
  locale = navigator.language,
  ...props
}: RangeFieldProps) {
  const groupRef = useRef<HTMLDivElement>(null)
  const startRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  const rangeState = useDateRangePickerState(props)

  const { groupProps, startFieldProps, endFieldProps } = useDateRangePicker(
    props,
    rangeState,
    groupRef,
  )

  const startState = useDateFieldState({
    ...(startFieldProps as AriaDateFieldProps<CalendarDate>),
    locale,
    createCalendar,
  })
  const endState = useDateFieldState({
    ...(endFieldProps as AriaDateFieldProps<CalendarDate>),
    locale,
    createCalendar,
  })

  const { fieldProps: startField } = useDateField(
    startFieldProps as AriaDateFieldProps<CalendarDate>,
    startState,
    startRef,
  )
  const { fieldProps: endField } = useDateField(
    endFieldProps as AriaDateFieldProps<CalendarDate>,
    endState,
    endRef,
  )

  return (
    <div
      {...groupProps}
      ref={groupRef}
      className={clsx(styles.field, iconSpacing && styles.fieldIconSpace, className)}
      data-invalid={rangeState.isInvalid || undefined}
      data-disabled={props.isDisabled || undefined}
    >
      <div {...startField} ref={startRef} className={styles.inlineSection}>
        {startState.segments.map((seg, i) => (
          <Segment key={i} segment={seg} state={startState} />
        ))}
      </div>
      <span className={styles.rangeInlineSeparator} aria-hidden="true">
        –
      </span>
      <div {...endField} ref={endRef} className={styles.inlineSection}>
        {endState.segments.map((seg, i) => (
          <Segment key={i} segment={seg} state={endState} />
        ))}
      </div>
    </div>
  )
}

// ─── Public API ──────────────────────────────────────────────────────────────

type DateInputSingleProps = SingleFieldProps & { mode?: 'single' }
type DateInputRangeProps = RangeFieldProps & { mode: 'range' }
type DateInputRangeInlineProps = RangeFieldProps & { mode: 'range-inline' }

export type DateInputProps = DateInputSingleProps | DateInputRangeProps | DateInputRangeInlineProps

export default function DateInput({ mode, ...rest }: DateInputProps) {
  if (mode === 'range') {
    return <RangeField {...(rest as RangeFieldProps)} />
  }
  if (mode === 'range-inline') {
    return <RangeInlineField {...(rest as RangeFieldProps)} />
  }
  return <SingleField {...(rest as SingleFieldProps)} />
}
