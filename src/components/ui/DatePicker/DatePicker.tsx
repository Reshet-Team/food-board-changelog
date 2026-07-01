import Calendar from '@/components/ui/Calendar/Calendar'
import DateInput from '@/components/ui/DateInput/DateInput'
import { PopoverContent, PopoverRoot, PopoverTrigger } from '@/components/ui/Popover/Popover'
import { fromDate, getLocalTimeZone, toCalendarDate } from '@internationalized/date'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import type { DateRange, DayPickerProps } from 'react-day-picker'
import styles from './DatePicker.module.scss'

const tz = getLocalTimeZone()
const toCalendar = (d: Date) => toCalendarDate(fromDate(d, tz))

type OmittedProps = 'mode' | 'selected' | 'onSelect' | 'month' | 'onMonthChange'
type CalendarPassthroughProps = Omit<DayPickerProps, OmittedProps>

export type DateRangeValue = { start: Date; end: Date }

interface SingleDatePickerProps extends CalendarPassthroughProps {
  mode: 'single'
  value: Date | null
  onChange: (value: Date | null) => void
}

interface RangeDatePickerProps extends CalendarPassthroughProps {
  mode: 'range'
  value: DateRangeValue | null
  onChange: (value: DateRangeValue | null) => void
}

type DatePickerProps = SingleDatePickerProps | RangeDatePickerProps

const now = new Date()
const defaultEndMonth = new Date()
defaultEndMonth.setMonth(11)
defaultEndMonth.setFullYear(now.getFullYear() + 10)

function DatePicker(props: DatePickerProps) {
  const [month, setMonth] = useState(new Date())

  const { mode, endMonth = defaultEndMonth, ...calendarProps } = props

  const selected: DateRange | undefined =
    mode === 'single'
      ? { from: props.value ?? undefined }
      : { from: props.value?.start, to: props.value?.end }

  const handleCalendarSelect = (selection: Date | DateRange | undefined) => {
    const from =
      mode === 'single'
        ? ((selection as Date | undefined) ?? null)
        : ((selection as DateRange | undefined)?.from ?? null)
    const to = mode === 'range' ? ((selection as DateRange | undefined)?.to ?? null) : null

    if (from) setMonth(from)

    if (props.mode === 'single') {
      props.onChange(from)
    } else {
      props.onChange(from && to ? { start: from, end: to } : null)
    }
  }

  return (
    <PopoverRoot>
      <div className={styles.inputWrapper}>
        {mode === 'single' ? (
          <DateInput
            iconSpacing
            value={props.value ? toCalendar(props.value) : null}
            onChange={(v) => props.onChange(v ? v.toDate(tz) : null)}
          />
        ) : (
          <DateInput
            mode="range-inline"
            iconSpacing
            value={
              props.value
                ? {
                    start: toCalendar(props.value.start),
                    end: toCalendar(props.value.end),
                  }
                : null
            }
            onChange={(range) => {
              if (range == null) {
                props.onChange(null)
                return
              }
              props.onChange({
                start: range.start.toDate(tz),
                end: range.end.toDate(tz),
              })
            }}
          />
        )}
        <PopoverTrigger
          render={
            <button className={styles.iconButton} aria-label="Open calendar">
              <CalendarIcon className={styles.icon} />
            </button>
          }
        />
      </div>

      <PopoverContent arrow={false} sideOffset={10} className={styles.popup}>
        {mode === 'single' ? (
          <Calendar
            {...(calendarProps as DayPickerProps)}
            month={month}
            endMonth={endMonth}
            onMonthChange={setMonth}
            mode="single"
            selected={selected.from}
            onSelect={handleCalendarSelect}
          />
        ) : (
          <Calendar
            {...(calendarProps as DayPickerProps)}
            month={month}
            endMonth={endMonth}
            onMonthChange={setMonth}
            mode="range"
            selected={selected}
            onSelect={handleCalendarSelect}
          />
        )}
      </PopoverContent>
    </PopoverRoot>
  )
}

export default DatePicker
