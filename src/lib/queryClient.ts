import { toastManager } from '@/components/ui/Toast/toastManager'
import { QueryCache, QueryClient } from '@tanstack/react-query'

// Shape of the optional per-query error toast. A query opts in by setting
// `meta: { errorToast: { title, description } }`; the global handler below
// then shows that toast whenever the query fails — no per-component effect.
interface ErrorToastMeta {
  title: string
  description?: string
}

// Teach TanStack Query about our custom `meta.errorToast` so it stays type-safe.
declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: {
      errorToast?: ErrorToastMeta
    }
  }
}

export const queryClient = new QueryClient({
  // A single global place to react to query failures. Any query that declares
  // `meta.errorToast` gets an error toast automatically, replacing per-component
  // `useEffect(() => { if (isError) toast.add(...) })` patterns.
  queryCache: new QueryCache({
    onError: (_error, query) => {
      const errorToast = query.meta?.errorToast
      if (!errorToast) return
      toastManager.add({
        type: 'error',
        title: errorToast.title,
        description: errorToast.description,
      })
    },
  }),
})
