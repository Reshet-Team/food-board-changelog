import { useEffect, useRef, type DependencyList, type RefObject } from 'react'

export function useResizeObserver<T extends Element>(
  ref: RefObject<T | null>,
  callback: () => void,
  deps: DependencyList = [],
): void {
  const callbackRef = useRef(callback)
  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const run = () => callbackRef.current()
    run()
    const observer = new ResizeObserver(run)
    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, ...deps])
}
