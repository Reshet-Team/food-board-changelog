import { type SlotProps } from '@/lib/styleUtilities'
import { Combobox as BaseCombobox } from '@base-ui/react/combobox'
import { Check, ChevronDown, X } from 'lucide-react'
import * as React from 'react'
import styles from './Combobox.module.scss'
import Primitives from './primitives'

interface ComboboxContextValue {
  itemToStringLabel?: (item: unknown) => string
  itemToStringValue?: (item: unknown) => string
}

const ComboboxContext = React.createContext<ComboboxContextValue>({})

function ComboboxRoot<Value, Multiple extends boolean | undefined = false>(
  props: BaseCombobox.Root.Props<Value, Multiple>,
) {
  return (
    <ComboboxContext.Provider
      value={{
        itemToStringLabel: props.itemToStringLabel as ((item: unknown) => string) | undefined,
        itemToStringValue: props.itemToStringValue as ((item: unknown) => string) | undefined,
      }}
    >
      <Primitives.Root {...props} />
    </ComboboxContext.Provider>
  )
}

const ComboboxChipRemove = Primitives.ChipRemove

export type ComboboxSize = 'sm' | 'md' | 'lg'

export interface ComboboxInputProps
  extends
    Omit<BaseCombobox.InputGroup.Props, 'children'>,
    SlotProps<typeof BaseCombobox, 'input' | 'clear' | 'trigger'> {
  inputId?: string
  placeholder?: string
  size?: ComboboxSize
  clearable?: boolean
}

function ComboboxInput({
  inputId,
  placeholder,
  size = 'md',
  clearable = true,
  inputProps,
  clearProps,
  triggerProps,
  ...props
}: ComboboxInputProps) {
  return (
    <Primitives.InputGroupRoot data-size={size} {...props}>
      <Primitives.Input id={inputId} placeholder={placeholder} {...inputProps} />
      <div className={styles.actionButtons}>
        {clearable && (
          <Primitives.Clear keepMounted aria-label='Clear selection' {...clearProps}>
            <X size={14} aria-hidden />
          </Primitives.Clear>
        )}
        <Primitives.Trigger aria-label='Open list' {...triggerProps}>
          <ChevronDown size={16} aria-hidden />
        </Primitives.Trigger>
      </div>
    </Primitives.InputGroupRoot>
  )
}

export interface ComboboxMultiInputProps<T = unknown>
  extends
    Omit<BaseCombobox.InputGroup.Props, 'children'>,
    SlotProps<typeof BaseCombobox, 'input' | 'trigger'> {
  inputId?: string
  placeholder?: string
  size?: ComboboxSize
  children?: (item: T, index: number) => React.ReactNode
}

function stringifyItemLabel(item: unknown, itemToStringLabel?: (item: unknown) => string): string {
  if (itemToStringLabel && item != null) return itemToStringLabel(item)
  if (item && typeof item === 'object') {
    if ('label' in item && item.label != null) return String(item.label)
    if ('value' in item) return String(item.value)
  }
  return String(item)
}

function getItemKey(
  item: unknown,
  index: number,
  itemToStringValue?: (item: unknown) => string,
): string | number {
  if (itemToStringValue && item != null) return itemToStringValue(item)
  if (typeof item === 'string' || typeof item === 'number') return item
  if (item && typeof item === 'object' && 'value' in item && item.value != null) {
    return String(item.value)
  }
  return index
}

function ComboboxMultiInput<T = unknown>({
  inputId,
  placeholder,
  size = 'md',
  children,
  inputProps,
  triggerProps,
  ...props
}: ComboboxMultiInputProps<T>) {
  const { itemToStringLabel, itemToStringValue } = React.use(ComboboxContext)

  return (
    <Primitives.InputGroupRoot data-size={size} {...props}>
      <Primitives.Chips>
        <Primitives.Value>
          {(selected: unknown) =>
            Array.isArray(selected)
              ? selected.map((item, i) =>
                  children ? (
                    children(item as T, i)
                  ) : (
                    <ComboboxChip key={getItemKey(item, i, itemToStringValue)}>
                      {stringifyItemLabel(item, itemToStringLabel)}
                    </ComboboxChip>
                  ),
                )
              : null
          }
        </Primitives.Value>
        <Primitives.Input id={inputId} placeholder={placeholder} {...inputProps} />
      </Primitives.Chips>
      <div className={styles.actionButtons}>
        <Primitives.Trigger aria-label='Open list' {...triggerProps}>
          <ChevronDown size={16} aria-hidden />
        </Primitives.Trigger>
      </div>
    </Primitives.InputGroupRoot>
  )
}

export interface ComboboxListProps<T = unknown> extends SlotProps<
  typeof BaseCombobox,
  'positioner' | 'popup' | 'empty' | 'list' | 'status'
> {
  emptyMessage?: React.ReactNode
  statusMessage?: React.ReactNode
  children: React.ReactNode | ((item: T, index: number) => React.ReactNode)
}

function ComboboxList<T = unknown>({
  emptyMessage = 'No results found.',
  statusMessage,
  children,
  positionerProps,
  popupProps,
  emptyProps,
  listProps,
  statusProps,
}: ComboboxListProps<T>) {
  const resolvedEmpty = statusMessage != null ? null : emptyMessage

  return (
    <Primitives.Portal>
      <Primitives.Positioner sideOffset={4} {...positionerProps}>
        <Primitives.Popup {...popupProps}>
          <Primitives.Status {...statusProps}>{statusMessage ?? null}</Primitives.Status>
          <Primitives.Empty {...emptyProps}>{resolvedEmpty}</Primitives.Empty>
          <Primitives.List {...listProps}>{children}</Primitives.List>
        </Primitives.Popup>
      </Primitives.Positioner>
    </Primitives.Portal>
  )
}

export interface ComboboxItemProps
  extends
    Omit<BaseCombobox.Item.Props, 'children'>,
    SlotProps<typeof BaseCombobox, 'itemIndicator'> {
  children: React.ReactNode
}

function ComboboxItem({ children, itemIndicatorProps, ...props }: ComboboxItemProps) {
  return (
    <Primitives.Item {...props}>
      <Primitives.ItemIndicator {...itemIndicatorProps}>
        <Check size={14} aria-hidden />
      </Primitives.ItemIndicator>
      <span className={styles.itemText}>{children}</span>
    </Primitives.Item>
  )
}

export interface ComboboxGroupProps<T = unknown> extends SlotProps<
  typeof BaseCombobox,
  'group' | 'groupLabel'
> {
  label: string
  items?: T[]
  children: ((item: T, index: number) => React.ReactNode) | React.ReactNode
}

function ComboboxGroup<T = unknown>({
  label,
  items,
  children,
  groupProps,
  groupLabelProps,
}: ComboboxGroupProps<T>) {
  return (
    <Primitives.Group items={items} {...groupProps}>
      <Primitives.GroupLabel {...groupLabelProps}>{label}</Primitives.GroupLabel>
      <Primitives.Collection>
        {children as (item: T, index: number) => React.ReactNode}
      </Primitives.Collection>
    </Primitives.Group>
  )
}

export interface ComboboxChipProps
  extends BaseCombobox.Chip.Props, SlotProps<typeof BaseCombobox, 'chipRemove'> {}

function ComboboxChip({ children, chipRemoveProps, ...props }: ComboboxChipProps) {
  return (
    <Primitives.Chip {...props}>
      {children}
      <Primitives.ChipRemove {...chipRemoveProps}>
        <X size={10} aria-hidden />
      </Primitives.ChipRemove>
    </Primitives.Chip>
  )
}

export {
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxMultiInput,
  ComboboxRoot,
}
