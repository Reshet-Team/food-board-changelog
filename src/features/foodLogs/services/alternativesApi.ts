import type { AlternativeOption } from '@/features/foodLogs/types/foodLog'

export async function fetchAlternatives(): Promise<AlternativeOption[]> {
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
