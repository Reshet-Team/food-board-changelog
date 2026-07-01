import { type SlotProps } from '@/lib/styleUtilities'
import type { Popover as BasePopover } from '@base-ui/react/popover'
import React from 'react'
import Primitives from './primitives'

const PopoverRoot = Primitives.Root
const PopoverTrigger = Primitives.Trigger
const PopoverTitle = Primitives.Title
const PopoverDescription = Primitives.Description
const PopoverClose = Primitives.Close

export interface PopoverContentProps
  extends
    BasePopover.Popup.Props,
    Pick<BasePopover.Positioner.Props, 'side' | 'sideOffset' | 'align' | 'alignOffset'>,
    SlotProps<typeof BasePopover, 'positioner' | 'arrow'> {
  children: React.ReactNode

  arrow?: boolean
}

function PopoverContent({
  children,
  side = 'bottom',
  sideOffset = 8,
  align,
  alignOffset,
  arrow = true,
  positionerProps,
  arrowProps,
  ...popupProps
}: PopoverContentProps) {
  return (
    <Primitives.Portal>
      <Primitives.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        {...positionerProps}
      >
        <Primitives.Popup {...popupProps}>
          {arrow && <Primitives.Arrow {...arrowProps} />}
          {children}
        </Primitives.Popup>
      </Primitives.Positioner>
    </Primitives.Portal>
  )
}

export {
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
}
