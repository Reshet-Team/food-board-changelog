import { SelectItem, SelectList, SelectRoot, SelectTrigger } from '@/components/ui/Select/Select'
import { useDirection } from '@base-ui/react/direction-provider'
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import {
  DayPicker,
  type ClassNames,
  type DayPickerProps,
  type DropdownProps,
} from 'react-day-picker'
import { he } from 'react-day-picker/locale'
import styles from './Calendar.module.scss'

const classNames = {
  // UI
  root: styles.root,
  chevron: styles.chevron,
  day: styles.day,
  day_button: styles.dayButton,
  caption_label: styles.captionLabel,
  dropdowns: styles.dropdowns,
  dropdown: styles.dropdown,
  dropdown_root: styles.dropdownRoot,
  footer: styles.footer,
  month_grid: styles.monthGrid,
  month_caption: styles.monthCaption,
  months_dropdown: styles.monthsDropdown,
  month: styles.month,
  months: styles.months,
  nav: styles.nav,
  button_next: styles.buttonNext,
  button_previous: styles.buttonPrevious,
  week: styles.week,
  weeks: styles.weeks,
  weekday: styles.weekday,
  weekdays: styles.weekdays,
  week_number: styles.weekNumber,
  week_number_header: styles.weekNumberHeader,
  years_dropdown: styles.yearsDropdown,

  // SelectionState
  range_end: styles.rangeEnd,
  range_middle: styles.rangeMiddle,
  range_start: styles.rangeStart,
  selected: styles.selected,

  // DayFlag
  disabled: styles.disabled,
  hidden: styles.hidden,
  outside: styles.outside,
  focused: styles.focused,
  today: styles.today,

  // Animation
  weeks_before_enter: styles.weeksBeforeEnter,
  weeks_before_exit: styles.weeksBeforeExit,
  weeks_after_enter: styles.weeksAfterEnter,
  weeks_after_exit: styles.weeksAfterExit,
  caption_after_enter: styles.captionAfterEnter,
  caption_after_exit: styles.captionAfterExit,
  caption_before_enter: styles.captionBeforeEnter,
  caption_before_exit: styles.captionBeforeExit,
} as Partial<ClassNames>

type CalendarProps = DayPickerProps

function CalendarDropdown({
  options,
  value,
  onChange,
  disabled,
  'aria-label': ariaLabel,
}: DropdownProps) {
  const stringValue = value !== undefined ? String(value) : undefined

  const handleValueChange = (newValue: string | null) => {
    if (newValue === null) return
    onChange?.({
      target: { value: newValue },
    } as React.ChangeEvent<HTMLSelectElement>)
  }

  return (
    <SelectRoot items={options} value={stringValue} onValueChange={handleValueChange}>
      <SelectTrigger
        size="sm"
        disabled={disabled}
        aria-label={ariaLabel}
        style={{ width: 'fit-content' }}
      >
        {(item: string) => options?.find((option) => option.value === Number(item))?.label}
      </SelectTrigger>
      <SelectList>
        {options?.map((opt) => (
          <SelectItem key={opt.value} value={String(opt.value)} disabled={opt.disabled}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectList>
    </SelectRoot>
  )
}

function Calendar({ formatters, ...props }: CalendarProps) {
  const dir = useDirection()
  const locale = dir === 'rtl' ? he : undefined

  return (
    <DayPicker
      animate
      showOutsideDays
      navLayout="around"
      captionLayout="dropdown"
      dir={dir}
      locale={locale}
      {...props}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString(locale?.code, { month: 'short' }),
        ...formatters,
      }}
      classNames={classNames}
      components={{
        Chevron: ({ className, orientation, ...props }) => {
          const effectiveOrientation =
            dir === 'rtl' && orientation === 'left'
              ? 'right'
              : dir === 'rtl' && orientation === 'right'
                ? 'left'
                : orientation

          if (effectiveOrientation === 'left') {
            return <ChevronLeftIcon size="1rem" className={className} {...props} />
          }

          if (effectiveOrientation === 'right') {
            return <ChevronRightIcon size="1rem" className={className} {...props} />
          }

          return <ChevronDownIcon size="1rem" className={className} {...props} />
        },
        Dropdown: CalendarDropdown,
        ...props.components,
      }}
    />
  )
}

export default Calendar
