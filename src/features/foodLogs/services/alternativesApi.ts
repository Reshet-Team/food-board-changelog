import type { AlternativeOption } from '@/features/foodLogs/types/foodLog'

// ─── Mock alternatives ────────────────────────────────────────────────────────
// Served when no SAP backend is configured. Alternatives 3 & 5 are "monthly"
// (no consumption date); 4 & 6 are "daily" and require a consumption date.
const MOCK_ALTERNATIVES: AlternativeOption[] = [
  { value: '01', description: 'חלופה רגילה' },
  { value: '02', description: 'חלופה רגילה' },
  { value: '03', description: 'חודשית' },
  { value: '04', description: 'יומית' },
  { value: '05', description: 'חודשית' },
  { value: '06', description: 'יומית' },
]

// Fetches the global list of alternative options for the search dropdown.
export async function fetchAlternatives(): Promise<AlternativeOption[]> {
  // Mock mode (VITE_USE_MOCK_DATA=true) or no SAP backend configured.
  if (import.meta.env.VITE_USE_MOCK_DATA === 'true' || !import.meta.env.VITE_SAP_API_BASE_URL) {
    await new Promise((resolve) => setTimeout(resolve, 300)) // simulate latency
    return MOCK_ALTERNATIVES
  }

  // Runs once when the screen opens: GET <base URL>/alternative.
  const baseUrl = import.meta.env.VITE_SAP_API_BASE_URL.replace(/\/+$/, '')
  const url = new URL(`${baseUrl}/alternative`)

  // Basic Auth — credentials loaded from env vars, never hardcoded
  const credentials = btoa(
    `${import.meta.env.VITE_SAP_USERNAME}:${import.meta.env.VITE_SAP_PASSWORD}`,
  )

  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Basic ${credentials}` },
  })

  if (!response.ok) throw new Error(`SAP error: ${response.status}`)

  const raw: AlternativeOption[] = await response.json()
  return raw
}
