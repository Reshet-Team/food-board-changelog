import { toastManager } from '@/components/ui/Toast/toastManager'
import { QueryCache, QueryClient } from '@tanstack/react-query'

interface ErrorToastMeta {
  title: string
  description?: string
}

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: {
      errorToast?: ErrorToastMeta
    }
  }
}

export const queryClient = new QueryClient({
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
