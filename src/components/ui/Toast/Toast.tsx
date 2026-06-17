import { clsx } from 'clsx'
import { AlertTriangle, CircleCheck, Info, X, XCircle } from 'lucide-react'
import React from 'react'
import Primitives from './primitives'
import styles from './Toast.module.scss'
import { useToast, type ToastObject } from './useToast'

type AnyToast = ToastObject<object>

const ToastTitle = Primitives.Title
const ToastDescription = Primitives.Description
const ToastAction = Primitives.Action
const ToastClose = Primitives.Close
const ToastArrow = Primitives.Arrow

export interface ToastAnchoredContentProps {
  children?: React.ReactNode
  arrow?: boolean
  className?: string
}

function ToastAnchoredContent({ children, arrow = true, className }: ToastAnchoredContentProps) {
  return (
    <div className={clsx(styles.anchoredContent, className)}>
      {arrow && <Primitives.Arrow />}
      {children}
    </div>
  )
}

function getTypeIcon(type: string | undefined) {
  switch (type) {
    case 'success':
      return <CircleCheck size={16} aria-hidden />
    case 'error':
      return <XCircle size={16} aria-hidden />
    case 'warning':
      return <AlertTriangle size={16} aria-hidden />
    case 'info':
      return <Info size={16} aria-hidden />
    default:
      return null
  }
}

function DefaultViewportToast({ toast }: { toast: AnyToast }) {
  const icon = getTypeIcon(toast.type)
  return (
    <Primitives.Root toast={toast}>
      <Primitives.Content>
        {icon != null && <span className={styles.icon}>{icon}</span>}
        <div className={styles.body}>
          {toast.title != null && <Primitives.Title>{toast.title}</Primitives.Title>}
          {toast.description != null && (
            <Primitives.Description>{toast.description}</Primitives.Description>
          )}
        </div>
        {toast.actionProps != null && <Primitives.Action {...toast.actionProps} />}
      </Primitives.Content>
      <Primitives.Close aria-label="Dismiss">
        <X size={14} aria-hidden="true" />
      </Primitives.Close>
    </Primitives.Root>
  )
}

function DefaultAnchoredToast({ toast }: { toast: AnyToast }) {
  return (
    <Primitives.Root toast={toast} className={styles.anchoredRoot}>
      <ToastAnchoredContent>
        {toast.title != null && <Primitives.Title>{toast.title}</Primitives.Title>}
        {toast.description != null && (
          <Primitives.Description>{toast.description}</Primitives.Description>
        )}
      </ToastAnchoredContent>
    </Primitives.Root>
  )
}

function ToastList({
  renderToast,
  renderAnchoredToast,
}: {
  renderToast?: (toast: AnyToast) => React.ReactNode
  renderAnchoredToast?: (toast: AnyToast) => React.ReactNode
}) {
  const { toasts } = useToast()

  const viewportToasts = toasts.filter((t) => t.positionerProps?.anchor == null)
  const anchoredToasts = toasts.filter((t) => t.positionerProps?.anchor != null)

  return (
    <>
      <Primitives.Viewport>
        {viewportToasts.map((toast) =>
          renderToast ? (
            <Primitives.Root key={toast.id} toast={toast}>
              {renderToast(toast)}
            </Primitives.Root>
          ) : (
            <DefaultViewportToast key={toast.id} toast={toast} />
          ),
        )}
      </Primitives.Viewport>

      {anchoredToasts.length > 0 && (
        <Primitives.Portal>
          {anchoredToasts.map((toast) => {
            const { anchor, ...positionerConfig } = toast.positionerProps ?? {}
            return (
              <Primitives.Positioner
                key={toast.id}
                toast={toast}
                anchor={anchor ?? null}
                side="top"
                sideOffset={8}
                {...positionerConfig}
              >
                {renderAnchoredToast ? (
                  <Primitives.Root toast={toast} className={styles.anchoredRoot}>
                    {renderAnchoredToast(toast)}
                  </Primitives.Root>
                ) : (
                  <DefaultAnchoredToast toast={toast} />
                )}
              </Primitives.Positioner>
            )
          })}
        </Primitives.Portal>
      )}
    </>
  )
}

export interface ToastProviderProps extends React.ComponentProps<typeof Primitives.Provider> {
  renderToast?: (toast: AnyToast) => React.ReactNode
  renderAnchoredToast?: (toast: AnyToast) => React.ReactNode
}

function ToastProvider({
  children,
  renderToast,
  renderAnchoredToast,
  ...props
}: ToastProviderProps) {
  return (
    <Primitives.Provider {...props}>
      {children}
      <Primitives.Portal>
        <ToastList
          {...(renderToast ? { renderToast } : {})}
          {...(renderAnchoredToast ? { renderAnchoredToast } : {})}
        />
      </Primitives.Portal>
    </Primitives.Provider>
  )
}

export {
  DefaultViewportToast,
  ToastAction,
  ToastAnchoredContent,
  ToastArrow,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
}
