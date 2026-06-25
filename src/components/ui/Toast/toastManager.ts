import { createToastManager } from './useToast'

// A single global toast manager shared by the React <ToastProvider> (which
// renders it) and by non-React code such as the TanStack Query error handler
// (which adds toasts to it). Creating it once here lets us fire toasts from
// outside the component tree without a context.
export const toastManager = createToastManager()
