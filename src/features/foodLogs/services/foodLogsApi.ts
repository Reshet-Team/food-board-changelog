import type { FoodLog, FoodLogsFilter } from '@/features/foodLogs/types/foodLog'
import { toSapDate } from '@/utils/date'
import { MOCK_FOOD_LOGS } from './mockFoodLogs'

// Applies the optional filters (material, changedBy, consumption-date range) to
// the in-memory mock dataset, so the screen behaves like the real SAP search
// while running without a backend.
function applyMockFilters(rows: FoodLog[], filter: FoodLogsFilter): FoodLog[] {
  const from = filter.consumptionDateFrom ? toSapDate(filter.consumptionDateFrom) : null
  const to = filter.consumptionDateTo ? toSapDate(filter.consumptionDateTo) : null

  return rows.filter((row) => {
    // Material: match if the row's (zero-padded) material equals any entered
    // value, compared numerically so "1234" matches "000000000000001234".
    if (filter.material?.length) {
      const matches = filter.material.some((value) => Number(value) === Number(row.material))
      if (!matches) return false
    }

    // Changed by: match if the row's user equals any entered value (case-insensitive).
    if (filter.changedBy?.length) {
      const matches = filter.changedBy.some(
        (value) => value.toLowerCase() === row.changedBy.toLowerCase(),
      )
      if (!matches) return false
    }

    // Consumption date: keep rows whose date falls within the range.
    if (from && row.consumptionDate < from) return false
    if (to && row.consumptionDate > to) return false

    return true
  })
}

export async function searchFoodLogs(filter: FoodLogsFilter): Promise<FoodLog[]> {
  // Mock mode (VITE_USE_MOCK_DATA=true) or no SAP backend configured → serve
  // mock data so the screen can be tested without a live SAP server.
  if (import.meta.env.VITE_USE_MOCK_DATA === 'true' || !import.meta.env.VITE_SAP_API_BASE_URL) {
    await new Promise((resolve) => setTimeout(resolve, 600)) // simulate latency
    // Empty-state demo: searching food board "0" returns no rows.
    if (filter.foodBoard === '0') return []
    return applyMockFilters(MOCK_FOOD_LOGS, filter)
  }

  const url = new URL('/api/food-logs', import.meta.env.VITE_SAP_API_BASE_URL)

  // Scalar string fields appended as-is; Date fields converted to SAP YYYYMMDD
  // format; array fields (material, changedBy) sent to SAP as a single
  // comma-separated value.
  const { dateFrom, dateTo, consumptionDateFrom, consumptionDateTo, material, changedBy, ...rest } =
    filter
  Object.entries(rest).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value)
  })
  if (material?.length) url.searchParams.set('material', material.join(','))
  if (changedBy?.length) url.searchParams.set('changedBy', changedBy.join(','))
  url.searchParams.set('dateFrom', toSapDate(dateFrom))
  if (dateTo) url.searchParams.set('dateTo', toSapDate(dateTo))
  if (consumptionDateFrom)
    url.searchParams.set('consumptionDateFrom', toSapDate(consumptionDateFrom))
  if (consumptionDateTo) url.searchParams.set('consumptionDateTo', toSapDate(consumptionDateTo))

  // Basic Auth — credentials loaded from env vars, never hardcoded
  const credentials = btoa(
    `${import.meta.env.VITE_SAP_USERNAME}:${import.meta.env.VITE_SAP_PASSWORD}`,
  )

  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Basic ${credentials}` },
  })

  if (!response.ok) throw new Error(`SAP error: ${response.status}`)

  const raw: FoodLog[] = await response.json()
  return raw
}
