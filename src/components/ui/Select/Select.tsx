import { type SlotProps } from '@/lib/styleUtilities'
import type { Select as BaseSelect } from '@base-ui/react/select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import Primitives from './primitives'

const SelectRoot = Primitives.Root

export type SelectSize = 'sm' | 'md' | 'lg'

export interface SelectTriggerProps
  extends
    Omit<BaseSelect.Trigger.Props, 'children'>,
    SlotProps<typeof BaseSelect, 'value' | 'icon'> {
  placeholder?: string
  size?: SelectSize
  children?: BaseSelect.Value.Props['children']
}

function SelectTrigger({
  placeholder,
  size = 'md',
  children,
  valueProps,
  iconProps,
  ...props
}: SelectTriggerProps) {
  return (
    <Primitives.Trigger data-size={size} {...props}>
      <Primitives.Value placeholder={placeholder} {...valueProps}>
        {children}
      </Primitives.Value>
      <Primitives.Icon {...iconProps}>
        <ChevronDown size={16} aria-hidden />
      </Primitives.Icon>
    </Primitives.Trigger>
  )
}

export interface SelectListProps<T = unknown> extends SlotProps<
  typeof BaseSelect,
  'positioner' | 'popup' | 'list' | 'scrollUpArrow' | 'scrollDownArrow'
> {
  items?: T[]
  children: React.ReactNode | ((item: T) => React.ReactNode)
}

function SelectList<T = unknown>({
  items,
  children,
  positionerProps,
  popupProps,
  listProps,
  scrollUpArrowProps,
  scrollDownArrowProps,
}: SelectListProps<T>) {
  const content = typeof children === 'function' ? items?.map(children) : children

  return (
    <Primitives.Portal>
      <Primitives.Positioner alignItemWithTrigger={false} sideOffset={4} {...positionerProps}>
        <Primitives.Popup {...popupProps}>
          <Primitives.ScrollUpArrow {...scrollUpArrowProps}>
            <ChevronUp size={14} aria-hidden />
          </Primitives.ScrollUpArrow>
          <Primitives.List {...listProps}>{content}</Primitives.List>
          <Primitives.ScrollDownArrow {...scrollDownArrowProps}>
            <ChevronDown size={14} aria-hidden />
          </Primitives.ScrollDownArrow>
        </Primitives.Popup>
      </Primitives.Positioner>
    </Primitives.Portal>
  )
}

export interface SelectItemProps
  extends
    Omit<BaseSelect.Item.Props, 'children' | 'label'>,
    SlotProps<typeof BaseSelect, 'itemText' | 'itemIndicator'> {
  children: string | React.ReactNode
}

function SelectItem({ children, itemTextProps, itemIndicatorProps, ...props }: SelectItemProps) {
  return (
    <Primitives.Item {...props}>
      <Primitives.ItemIndicator {...itemIndicatorProps}>
        <Check size={14} aria-hidden />
      </Primitives.ItemIndicator>
      <Primitives.ItemText {...itemTextProps}>{children}</Primitives.ItemText>
    </Primitives.Item>
  )
}

export interface SelectGroupProps<T = unknown> extends SlotProps<
  typeof BaseSelect,
  'group' | 'groupLabel'
> {
  label: string
  items?: T[]
  children: React.ReactNode | ((item: T) => React.ReactNode)
}

function SelectGroup<T = unknown>({
  label,
  items,
  children,
  groupProps,
  groupLabelProps,
}: SelectGroupProps<T>) {
  const content = typeof children === 'function' ? items?.map(children) : children

  return (
    <Primitives.Group {...groupProps}>
      <Primitives.GroupLabel {...groupLabelProps}>{label}</Primitives.GroupLabel>
      {content}
    </Primitives.Group>
  )
}

export { SelectGroup, SelectItem, SelectList, SelectRoot, SelectTrigger }
