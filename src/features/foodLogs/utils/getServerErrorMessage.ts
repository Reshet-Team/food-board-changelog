import axios from 'axios'

// The search answers with an array of rows, or fails with a plain string explaining why there are none.
// An unreachable backend answers with the SPA's HTML, which is a string too.
export function getServerMessage(error: unknown): string {
  if (axios.isAxiosError(error) && typeof error.response?.data === 'string') {
    const message = error.response.data.trim()
    if (message) return message
  }

  // Network / transport failures never reach the service, so there is no server text to show.
  return 'שגיאה בטעינת הנתונים, אירעה שגיאה בעת טעינת רשומות השינויים.'
}
