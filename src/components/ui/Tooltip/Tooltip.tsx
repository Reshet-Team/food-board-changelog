import { type SlotProps } from '@/lib/styleUtilities'
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import React from 'react'
import Primitives from './primitives'
import styles from './Tooltip.module.scss'

const TooltipRoot = Primitives.Root
const TooltipViewport = Primitives.Viewport

const TooltipHandleContext = React.createContext<BaseTooltip.Handle<React.ReactNode> | null>(null)

const TooltipProvider = BaseTooltip.Provider

function AnimatedTooltipProvider({ children, ...props }: BaseTooltip.Provider.Props) {
  const [handle] = React.useState(() => BaseTooltip.createHandle<React.ReactNode>())

  return (
    <TooltipHandleContext.Provider value={handle}>
      <BaseTooltip.Provider {...props}>
        {children}
        <BaseTooltip.Root handle={handle}>
          {({ payload }) => (
            <Primitives.Portal>
              <Primitives.Positioner sideOffset={8} className={styles.positionerAnimated}>
                <Primitives.Popup className={styles.popupAnimated}>
                  <Primitives.Arrow />
                  <Primitives.Viewport>{payload}</Primitives.Viewport>
                </Primitives.Popup>
              </Primitives.Positioner>
            </Primitives.Portal>
          )}
        </BaseTooltip.Root>
      </BaseTooltip.Provider>
    </TooltipHandleContext.Provider>
  )
}

export type TooltipTriggerProps = BaseTooltip.Trigger.Props<React.ReactNode>

function TooltipTrigger({ handle: handleProp, payload, ...props }: TooltipTriggerProps) {
  const contextHandle = React.use(TooltipHandleContext)
  const handle = handleProp ?? contextHandle ?? undefined
  return <BaseTooltip.Trigger handle={handle} payload={payload} {...props} />
}

export interface TooltipContentProps
  extends
    BaseTooltip.Popup.Props,
    Pick<BaseTooltip.Positioner.Props, 'side' | 'sideOffset' | 'align' | 'alignOffset'>,
    SlotProps<typeof BaseTooltip, 'positioner' | 'arrow'> {
  children: React.ReactNode
  arrow?: boolean
}

function TooltipContent({
  children,
  side = 'top',
  sideOffset = 8,
  align,
  alignOffset,
  arrow = true,
  positionerProps,
  arrowProps,
  ...popupProps
}: TooltipContentProps) {
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
  AnimatedTooltipProvider,
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipViewport,
}
