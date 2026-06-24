import clsx from 'clsx'
import React from 'react'

/**
 * Binds a base CSS module class to a component while preserving its full type.
 * Any `className` passed at usage-time is merged in via clsx.
 */
export function styled<P>(
  Component: React.ComponentType<P>,
  baseClass: string | undefined,
): typeof Component {
  const Styled = (props: P & { className?: string }) => (
    <Component {...(props as P)} className={clsx(baseClass, props.className)} />
  )

  const c = Component as { displayName?: string; name?: string }
  Styled.displayName = `Styled(${c.displayName ?? c.name ?? 'Component'})`

  return Styled as typeof Component
}
