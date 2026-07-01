import type { AlternativeOption } from '@/features/foodLogs/types/foodLog'

const MOCK_ALTERNATIVES: AlternativeOption[] = [
  { value: '01', typeValue: '1', typeDescription: 'רגילה' },
  { value: '02', typeValue: '1', typeDescription: 'רגילה' },
  { value: '03', typeValue: '3', typeDescription: 'חודשית' },
  { value: '04', typeValue: '4', typeDescription: 'יומית' },
  { value: '05', typeValue: '5', typeDescription: 'חודשית' },
  { value: '06', typeValue: '6', typeDescription: 'יומית' },
]

export async function fetchAlternatives(): Promise<AlternativeOption[]> {
  if (import.meta.env.VITE_USE_MOCK_DATA === 'true' || !import.meta.env.VITE_SAP_API_BASE_URL) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return MOCK_ALTERNATIVES
  }

  const baseUrl = import.meta.env.VITE_SAP_API_BASE_URL.replace(/\/+$/, '')
  const url = new URL(`${baseUrl}/alternative`)

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
