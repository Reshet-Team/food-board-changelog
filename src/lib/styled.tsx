import clsx from 'clsx'
import React from 'react'

export function styled<TProps>(
  Component: React.ComponentType<TProps>,
  baseClass: string | undefined,
): typeof Component {
  const Styled = (props: TProps & { className?: string }) => (
    <Component {...props} className={clsx(baseClass, props.className)} />
  )

  const c = Component as { displayName?: string; name?: string }
  Styled.displayName = `Styled(${c.displayName ?? c.name ?? 'Component'})`

  return Styled as typeof Component
}
