import { useEffect, useRef, type DependencyList, type RefObject } from 'react'

/**
 * Run `callback` once when the element held by `ref` mounts and again whenever
 * it changes size. The callback is stored in a ref, so passing a fresh function
 * each render does not tear down and recreate the observer. Pass `deps` to also
 * re-run the callback when other values change (e.g. the text inside the element
 * changed, which can affect overflow without a size change).
 */
export function useResizeObserver<T extends Element>(
  ref: RefObject<T | null>,
  callback: () => void,
  deps: DependencyList = [],
): void {
  // Keep the latest callback without re-subscribing the observer every render.
  const callbackRef = useRef(callback)
  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const run = () => callbackRef.current()
    run() // measure immediately on mount / when deps change
    const observer = new ResizeObserver(run)
    observer.observe(el)
    return () => observer.disconnect()
    // `ref` is stable; `deps` lets callers re-measure on relevant value changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, ...deps])
}
