import type { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area'
import React from 'react'
import Primitives from './primitives'

export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both'

export interface ScrollAreaProps extends BaseScrollArea.Root.Props {
  children: React.ReactNode
  orientation?: ScrollAreaOrientation
}

function ScrollArea({ children, orientation = 'vertical', ...props }: ScrollAreaProps) {
  const both = orientation === 'both'
  return (
    <Primitives.Root {...props}>
      <Primitives.Viewport>
        <Primitives.Content>{children}</Primitives.Content>
      </Primitives.Viewport>
      {(orientation === 'vertical' || both) && (
        <Primitives.Scrollbar orientation="vertical">
          <Primitives.Thumb />
        </Primitives.Scrollbar>
      )}
      {(orientation === 'horizontal' || both) && (
        <Primitives.Scrollbar orientation="horizontal">
          <Primitives.Thumb />
        </Primitives.Scrollbar>
      )}
      {both && <Primitives.Corner />}
    </Primitives.Root>
  )
}

export { ScrollArea }
