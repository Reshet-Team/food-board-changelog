# Food Logs Screen — Phase 3: API Service & Data Fetching

## API Service (`services/foodLogsApi.ts`)

**Confirmed:** REST API, `GET` request, Basic Auth, response is a flat JSON array `[...]`.

```ts
export async function searchFoodLogs(filter: FoodLogsFilter): Promise<FoodLog[]> {
  const url = new URL('/api/food-logs', import.meta.env.VITE_SAP_API_BASE_URL)

  // All DATUM values are already in YYYYMMDD format — append as query params
  Object.entries(filter).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, value)
  })

  // Basic Auth — credentials loaded from env vars, never hardcoded
  const credentials = btoa(
    `${import.meta.env.VITE_SAP_USERNAME}:${import.meta.env.VITE_SAP_PASSWORD}`,
  )

  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Basic ${credentials}` },
  })

  if (!response.ok) throw new Error(`SAP error: ${response.status}`)

  const raw: FoodLog[] = await response.json() // flat array, numbers are native JSON numbers
  return raw
}
```

### Open questions for the SAP integration

| #   | Question                                          | Status             |
| --- | ------------------------------------------------- | ------------------ |
| 1   | Exact endpoint path on the SAP server             | Not yet determined |
| 2   | Exact SAP query param names for each filter field | Not yet determined |
| 3   | Exact JSON field names in each response row       | Not yet determined |
| 4   | Server-side record limit (max rows cap)           | Not yet determined |

> Once the SAP team provides the API contract, update the `url` path and the param/field name mappings in `foodLogsApi.ts`.

---

## Data Fetching Hook (`hooks/useFoodLogs.ts`)

Uses the **TanStack Query key factory pattern** to ensure every unique filter combination gets its own cache entry and cache invalidation is always targeted.

```ts
import { useQuery } from '@tanstack/react-query'
import { searchFoodLogs } from '@/features/foodLogs/services/foodLogsApi'
import type { FoodLogsFilter, FoodLog } from '@/features/foodLogs/types/foodLog'

// ─── Query key factory ───────────────────────────────────────────────────────
// Single source of truth for all foodLogs cache keys.
export const foodLogsKeys = {
  all: () => ['foodLogs'] as const,
  search: (filter: FoodLogsFilter) => [...foodLogsKeys.all(), filter] as const,
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useFoodLogs(filter: FoodLogsFilter | null) {
  return useQuery({
    queryKey: foodLogsKeys.search(filter!),
    queryFn: () => searchFoodLogs(filter!),
    enabled: filter !== null, // only run when a search has been submitted
    staleTime: 5 * 60 * 1000, // 5 min — SAP data changes infrequently during a session
    retry: 1, // one retry; SAP errors are often deterministic
  })
}
```

### Key design points

- `queryKey` includes the **full filter object** — every unique filter combination has its own cache entry.
- `enabled: filter !== null` blocks the query until the user explicitly submits a search.
- `staleTime: 5 min` prevents hammering SAP on repeated identical searches within the same session.
- `retry: 1` limits retries — SAP auth failures and missing-param errors won't resolve on retry.
