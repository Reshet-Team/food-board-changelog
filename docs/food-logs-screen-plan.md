# Food Logs Screen — Implementation Plan

> This plan is split into per-phase documents inside [`docs/food-logs/`](food-logs/).

| Phase | File                                                                     | Contents                                                                                  |
| ----- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| 1     | [phase-1-setup.md](food-logs/phase-1-setup.md)                           | Overview, feature folder structure, dependencies, environment variables                   |
| 2     | [phase-2-types.md](food-logs/phase-2-types.md)                           | ABAP → TypeScript type mapping, `FoodLog` / `FoodLogsFilter` interfaces, Zod schema       |
| 3     | [phase-3-api-and-fetching.md](food-logs/phase-3-api-and-fetching.md)     | API service (`foodLogsApi.ts`), `useFoodLogs` hook, query key factory                     |
| 4     | [phase-4-search-form.md](food-logs/phase-4-search-form.md)               | Route file, URL state, UniForm integration, mandatory + optional fields, submit behaviour |
| 5     | [phase-5-table-and-assembly.md](food-logs/phase-5-table-and-assembly.md) | `FoodLogsPage`, data flow, `FoodLogsTable` states + columns + scroll, open questions      |

## ABAP → TypeScript Type Mapping

SAP returns data in ABAP-native formats that must be handled carefully in TypeScript to avoid runtime bugs.

| ABAP Type   | Description            | TypeScript Type | Wire format / notes                                                                               |
| ----------- | ---------------------- | --------------- | ------------------------------------------------------------------------------------------------- |
| `STNUM`     | Food board number      | `string`        | Alphanumeric, keep as-is                                                                          |
| `ALTNR`     | Alternative number     | `string`        | Numeric string, keep as-is                                                                        |
| `MATNR`     | Material number        | `string`        | CHAR18, zero-padded (e.g. `"000000000001234"`). Store raw; format for display only.               |
| `DATUM`     | Date                   | `string`        | **YYYYMMDD** format (e.g. `"20260616"`). Never ISO. Convert to/from `Date` only at display layer. |
| `UZEIT`     | Time                   | `string`        | **HHMMSS** format (e.g. `"143000"`). Store raw; format for display only.                          |
| `USNAM`     | Username               | `string`        | CHAR12, alphanumeric                                                                              |
| `DDTEXT`    | Description text       | `string`        | CHAR, variable length                                                                             |
| `KMPMG`     | Component quantity     | `number`        | Packed decimal (QUAN). REST JSON serializes this as a native JSON number.                         |
| `CIM_COUNT` | Day-in-period counter  | `number`        | Integer. REST JSON serializes this as a native JSON number.                                       |
| `FIELDNAME` | Field name             | `string`        | CHAR30                                                                                            |
| `CDFLDVALO` | Change doc field value | `string`        | CHAR30, holds old or new field value                                                              |

> **Note:** Because this is a REST API, all numeric fields (`KMPMG`, `CIM_COUNT`) are returned as native JSON numbers — no string coercion is needed.

---

## Route

**File:** `src/routes/food-logs.tsx`

- Registered automatically by TanStack Router's file-based discovery.
- URL: `/food-logs`
- Declares **search params schema** (Zod) so filter state lives in the URL — making results bookmarkable and shareable.
- No business logic inline — only wires the route's search params into the feature component.

---

## Feature Structure

```
src/features/foodLogs/
├── components/
│   ├── FoodLogsPage/
│   │   ├── FoodLogsPage.tsx          # Top-level page layout
│   │   └── FoodLogsPage.module.scss
│   ├── FoodLogsSearchForm/
│   │   ├── FoodLogsSearchForm.tsx    # Search form UI
│   │   └── FoodLogsSearchForm.module.scss
│   └── FoodLogsTable/
│       ├── FoodLogsTable.tsx         # Results table (sortable, scrollable)
│       └── FoodLogsTable.module.scss
├── hooks/
│   └── useFoodLogs.ts                # TanStack Query hook
├── services/
│   └── foodLogsApi.ts                # SAP API calls + response mapping
└── types/
    └── foodLog.ts                    # TypeScript types & Zod schemas
```

---

## TypeScript Types (`types/foodLog.ts`)

```ts
// ─── Search Filter ──────────────────────────────────────────────────────────
// Drives both the form state and the SAP API request params.

export interface FoodLogsFilter {
  // Mandatory
  foodBoard: string // STNUM  — Food Board number
  alternative: string // ALTNR  — Alternative number
  dateFrom: string // DATUM  — From Change Date (YYYYMMDD). Default: yesterday.

  // Optional
  dateTo?: string // DATUM  — To Change Date (YYYYMMDD). Default: today.
  //          Range cannot exceed 6 months from dateFrom.
  material?: string // MATNR  — Material number (zero-padded CHAR18)
  consumptionDate?: string // DATUM  — Specific consumption date (YYYYMMDD)
  changeTime?: string // UZEIT  — Specific change time (HHMMSS)
  changedBy?: string // USNAM  — Username who made the change
}

// ─── Food Log Record (one table row) ────────────────────────────────────────
// Represents a single change-log entry returned by SAP.

export interface FoodLog {
  typeOfChange: string // DDTEXT   — Description of the change type
  material: string // MATNR    — Material number (CHAR18, zero-padded)
  quantity: number // KMPMG    — Component quantity (coerced from string)
  consumptionDate: string // DATUM    — Consumption date (YYYYMMDD)
  dayInPeriod: number // CIM_COUNT — Day counter within the period (coerced from string)
  changeDate: string // DATUM    — Date of change (YYYYMMDD)
  changeTime: string // UZEIT    — Time of change (HHMMSS)
  changedBy: string // USNAM    — Username who made the change
  field: string // FIELDNAME — Name of the changed field
  oldValue: string // CDFLDVALO — Value before the change
  newValue: string // CDFLDVALO — Value after the change
}
```

---

## Search Params (URL state)

The active filter is stored as typed URL search params via TanStack Router:

- Refreshing the page preserves the last search.
- The URL can be copied and shared.
- The back button restores the previous search.

**Schema (Zod, declared in the route file):**

```ts
// Dates are stored in the URL as YYYYMMDD strings to match SAP wire format exactly.
const foodLogsSearchSchema = z.object({
  foodBoard: z.string().default(''),
  alternative: z.string().default(''),
  dateFrom: z.string().default(yesterdayYYYYMMDD()), // helper returns e.g. "20260615"
  dateTo: z.string().default(todayYYYYMMDD()), // helper returns e.g. "20260616"
  material: z.string().optional(),
  consumptionDate: z.string().optional(),
  changeTime: z.string().optional(),
  changedBy: z.string().optional(),
})
```

**Date range validation rule:** `dateTo` must be within 6 months of `dateFrom`. This is enforced in the form before submit (not at the Zod schema level, to give a better UX error message).

---

## Data Flow

```
User fills form
      │
      ▼
[FoodLogsSearchForm] validates:
  • foodBoard, alternative, dateFrom are non-empty
  • dateTo − dateFrom ≤ 6 months
      │  on valid submit
      ▼
router.navigate({ search: filterValues })   ← updates URL params
      │
      ▼
[useFoodLogs(filter)] — TanStack Query
  • query key: ['foodLogs', filter]
  • enabled: only when foodBoard + alternative + dateFrom are filled
  • calls foodLogsApi.search(filter)
      │
      ▼
[foodLogsApi.ts] — HTTP request to SAP server
  • REST API — GET request with filter values as query params
  • Base URL from env var: VITE_SAP_API_BASE_URL
  • Endpoint path TBD
  • Authorization: Basic Auth (credentials from env vars)
  • Response: flat JSON array — no wrapper
      │
      ▼
[FoodLogsTable] renders sortable, scrollable rows
```

---

## Component Breakdown

### `FoodLogsPage`

- Reads current search params from the router.
- Renders `FoodLogsSearchForm` above `FoodLogsTable`.
- Passes the active filter into `useFoodLogs` and threads the result into the table.

### `FoodLogsSearchForm`

All interactive controls use **Reshet UI** components, installed via `pnpx shadcn@latest add @reshet-ui/<name>`.

**Form library: UniForm (`@uniform-ts/core`)**

The search form is built with [UniForm](https://uniform-ts.dev) — a headless, Zod-driven form library. The workflow is:

1. Define the Zod schema (`foodLogsSearchSchema`) as the **single source of truth** for field shapes, types, defaults, and validation.
2. Wrap it: `const searchForm = createForm(foodLogsSearchSchema)`.
3. Render: `<AutoForm form={searchForm} onSubmit={handleSearch} components={reshetComponents} />`
4. Layer Reshet UI into a `components` registry (maps Zod primitive types to Reshet UI components: `string` → `@reshet-ui/input`, `date` → `@reshet-ui/date-picker`).
5. Use `fields` overrides to set per-field `label`, `required`, and the `type="time"` attribute on `changeTime`.

This keeps all form state and validation in the schema — no manual `register()`, `watch()`, or `useForm` boilerplate.

**Mandatory fields** (marked with `*`, submit blocked if empty):

| Label            | ABAP Field | ABAP Type | Reshet UI component      |
| ---------------- | ---------- | --------- | ------------------------ |
| לוח מזון \*      | `STNUM`    | `STNUM`   | `@reshet-ui/input`       |
| חלופה \*         | `ALTNR`    | `ALTNR`   | `@reshet-ui/input`       |
| מתאריכו שינוי \* | `dateFrom` | `DATUM`   | `@reshet-ui/date-picker` |

**Optional fields:**

| Label           | ABAP Field        | ABAP Type | Reshet UI component                   | Notes                                                                                                                                   |
| --------------- | ----------------- | --------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| עד תאריכו שינוי | `dateTo`          | `DATUM`   | `@reshet-ui/date-picker`              | Default: today. Max 6 months from `dateFrom`.                                                                                           |
| חומר            | `MATNR`           | `MATNR`   | `@reshet-ui/input`                    |                                                                                                                                         |
| תאריך צריכה     | `consumptionDate` | `DATUM`   | `@reshet-ui/date-picker`              |                                                                                                                                         |
| שעת שינוי       | `changeTime`      | `UZEIT`   | `@reshet-ui/input` with `type="time"` | No Reshet UI time picker exists. Native `<input type="time">` returns `HH:MM`; append `":00"` → strip colons to build `HHMMSS` for SAP. |
| שונה ע"י        | `changedBy`       | `USNAM`   | `@reshet-ui/input`                    |                                                                                                                                         |

**Field wrapper & layout:**

- Each input is wrapped in `@reshet-ui/field` which provides the `<label>`, required indicator (`*`), description slot, and inline error message.
- Related fields (e.g. date range From/To) are grouped under `@reshet-ui/fieldset`.
- Form actions (Submit + Reset) use `@reshet-ui/button`.

- Submit button disabled while mandatory fields are empty or a fetch is in-flight.
- Clicking **חפש** (Search) calls `router.navigate` → triggers query.
- Clicking **איפוס** (Reset) restores defaults (dateFrom = yesterday, dateTo = today, rest cleared).

### `useFoodLogs` hook (`hooks/useFoodLogs.ts`)

Follows the **TanStack Query key factory pattern** to avoid cache bugs:

```ts
// Query key factory — single source of truth for all foodLogs cache keys
export const foodLogsKeys = {
  all: () => ['foodLogs'] as const,
  search: (filter: FoodLogsFilter) => [...foodLogsKeys.all(), filter] as const,
}

export function useFoodLogs(filter: FoodLogsFilter | null) {
  return useQuery({
    queryKey: foodLogsKeys.search(filter!),
    queryFn: () => searchFoodLogs(filter!),
    enabled: filter !== null, // only run when a search has been submitted
    staleTime: 5 * 60 * 1000, // 5 min — SAP data changes infrequently during a session
    retry: 1, // one retry on SAP errors; more can cause slow UX
  })
}
```

Key design points (per TanStack Query best practices):

- `queryKey` includes the **full filter object** so every unique filter combination gets its own cache entry.
- `enabled: filter !== null` blocks the query until a search is actually submitted.
- `staleTime: 5 min` avoids hammering SAP on repeated identical searches within a session.
- `retry: 1` limits retries — SAP errors are often deterministic (auth failure, missing params).

---

### `FoodLogsTable`

**States:**

- **Idle** (search not yet submitted): neutral prompt.
- **Loading**: `@reshet-ui/skeleton` rows (same column widths as real rows) + `@reshet-ui/spinner` in the submit button.
- **Error**: `@reshet-ui/toast` notification + inline retry button.
- **Empty**: `@reshet-ui/empty` component with a "לא נמצאו תוצאות" message.
- **Success**: data rows.

**Scroll container:**

- The table is wrapped in `@reshet-ui/scroll-area` which provides a styled, cross-browser scrollbar.
- `max-height: calc(100dvh - <header + form height>)` is set on the scroll area so the number of visible rows adapts to the screen size.

**Columns** (all sortable, asc ↕ desc per column):

| #   | Column header | Field             | Type     | Sort logic                                         |
| --- | ------------- | ----------------- | -------- | -------------------------------------------------- |
| 1   | סוג שינוי     | `typeOfChange`    | `string` | Lexicographic                                      |
| 2   | חומר          | `material`        | `string` | Lexicographic (zero-padded CHAR18)                 |
| 3   | כמות          | `quantity`        | `number` | Numeric                                            |
| 4   | תאריך צריכה   | `consumptionDate` | `string` | Chronological (YYYYMMDD sorts correctly as string) |
| 5   | יום בתקופה    | `dayInPeriod`     | `number` | Numeric                                            |
| 6   | תאריך שינוי   | `changeDate`      | `string` | Chronological                                      |
| 7   | שעת שינוי     | `changeTime`      | `string` | Chronological (HHMMSS sorts correctly as string)   |
| 8   | שונה ע"י      | `changedBy`       | `string` | Lexicographic                                      |
| 9   | שדה           | `field`           | `string` | Lexicographic                                      |
| 10  | ערך ישן       | `oldValue`        | `string` | Lexicographic                                      |
| 11  | ערך חדש       | `newValue`        | `string` | Lexicographic                                      |

**Scrolling behaviour:**

- The table container has a `max-height` calculated from the viewport (e.g. `calc(100dvh - <header + form height>)`), so the number of visible rows adapts to screen size.
- `overflow-y: auto` on the table container activates a scrollbar only when rows exceed the visible area.
- The `<thead>` row is **sticky** (`position: sticky; top: 0`) so column headers remain visible while scrolling.
- Sorting is handled **client-side** via TanStack Table (`@tanstack/react-table`) — no additional SAP requests on sort.

---

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

**Remaining open questions for the SAP integration:**

- What is the exact endpoint path? _(not yet determined)_
- What are the exact SAP query param names for each filter field? _(not yet determined)_
- What are the exact SAP JSON field names in each response row? _(not yet determined)_
- Is there a server-side record limit? _(not yet determined)_

---

## Environment Variables

A `.env` file (and `.env.example`) will need:

```
VITE_SAP_API_BASE_URL=https://your-sap-server.example.com
VITE_SAP_USERNAME=your-username
VITE_SAP_PASSWORD=your-password
```

> **Security note:** `VITE_SAP_PASSWORD` is a build-time env var exposed to the browser bundle. This is acceptable only for internal/intranet apps where the network perimeter is the access control. Do not use this pattern for public-facing applications.

---

## New Dependencies

All UI components are installed from the **Reshet UI registry** via `pnpx shadcn@latest add @reshet-ui/<name>`. Do not add `@tanstack/react-table` directly — `@reshet-ui/data-table` bundles it.

| Package / Component      | Reason                                       | How to install                                  |
| ------------------------ | -------------------------------------------- | ----------------------------------------------- |
| `zod`                    | Search param schema + validation             | `pnpm add zod` (verify if already installed)    |
| `@uniform-ts/core`       | Headless Zod-driven search form              | `pnpm add @uniform-ts/core`                     |
| `@reshet-ui/data-table`  | Sortable, scrollable data table              | `pnpx shadcn@latest add @reshet-ui/data-table`  |
| `@reshet-ui/date-picker` | Date inputs for DATUM fields                 | `pnpx shadcn@latest add @reshet-ui/date-picker` |
| `@reshet-ui/input`       | Text inputs for string fields                | `pnpx shadcn@latest add @reshet-ui/input`       |
| `@reshet-ui/button`      | Search + Reset action buttons                | `pnpx shadcn@latest add @reshet-ui/button`      |
| `@reshet-ui/field`       | Label + input + error wrapper per field      | `pnpx shadcn@latest add @reshet-ui/field`       |
| `@reshet-ui/fieldset`    | Groups related form fields (e.g. date range) | `pnpx shadcn@latest add @reshet-ui/fieldset`    |
| `@reshet-ui/skeleton`    | Skeleton loading rows in the table           | `pnpx shadcn@latest add @reshet-ui/skeleton`    |
| `@reshet-ui/empty`       | Empty-results state in the table             | `pnpx shadcn@latest add @reshet-ui/empty`       |
| `@reshet-ui/scroll-area` | Styled cross-browser scrollbar for the table | `pnpx shadcn@latest add @reshet-ui/scroll-area` |
| `@reshet-ui/spinner`     | In-button loading indicator during fetch     | `pnpx shadcn@latest add @reshet-ui/spinner`     |
| `@reshet-ui/toast`       | Error notifications                          | `pnpx shadcn@latest add @reshet-ui/toast`       |

---

## Open Questions Summary

1. **Endpoint path** — exact URL path on the SAP server. _(not yet determined)_
2. **Query param names** — exact SAP-side names for each filter field sent in the GET request. _(not yet determined)_
3. **Response field names** — exact JSON field names in each row of the flat array response. _(not yet determined)_
4. **Server-side record limit** — is there a max rows cap? _(not yet determined)_
5. **Permissions** — is this screen accessible to all users or role-gated? _(not yet determined)_
6. **Error handling UX** — `@reshet-ui/toast` notification + inline retry button. _(resolved: `@reshet-ui/toast` is available)_
