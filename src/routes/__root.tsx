import { ToastProvider } from '@/components/ui/Toast/Toast'
import { toastManager } from '@/components/ui/Toast/toastManager'
import { TooltipProvider } from '@/components/ui/Tooltip/Tooltip'
import { ThemeProvider } from '@/theme/useTheme'
import { DirectionProvider } from '@base-ui/react/direction-provider'
import type { QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ThemeProvider>
      <DirectionProvider direction="rtl">
        <ToastProvider toastManager={toastManager}>
          <TooltipProvider delay={300} closeDelay={100}>
            <Outlet />
          </TooltipProvider>
        </ToastProvider>
      </DirectionProvider>
    </ThemeProvider>
  )
}
