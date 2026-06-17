# Food Logs Screen — Phase 5: Results Table & Page Assembly

## `FoodLogsPage` Component

- Reads the current search params from the router (`Route.useSearch()`).
- Derives a `FoodLogsFilter | null` from the params (null when mandatory fields are empty — i.e. on first load with defaults).
- Passes the filter into `useFoodLogs(filter)`.
- Renders `FoodLogsSearchForm` above `FoodLogsTable`, threading query state into the table.

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
  • calls foodLogsApi.searchFoodLogs(filter)
      │
      ▼
[foodLogsApi.ts] — HTTP GET to SAP server
  • Base URL: VITE_SAP_API_BASE_URL
  • Authorization: Basic Auth (from env vars)
  • Response: flat JSON array
      │
      ▼
[FoodLogsTable] renders sortable, scrollable rows
```

---

## `FoodLogsTable` Component

### UI States

| State       | Trigger                        | Rendering                                                                                       |
| ----------- | ------------------------------ | ----------------------------------------------------------------------------------------------- |
| **Idle**    | No search submitted yet        | Neutral prompt message                                                                          |
| **Loading** | `isLoading` from `useFoodLogs` | `@reshet-ui/skeleton` rows (matching column widths) + `@reshet-ui/spinner` inside Search button |
| **Error**   | `isError` from `useFoodLogs`   | `@reshet-ui/toast` notification + inline retry button                                           |
| **Empty**   | Successful fetch, zero rows    | `@reshet-ui/empty` with "לא נמצאו תוצאות"                                                       |
| **Success** | Rows returned                  | Full data table                                                                                 |

### Scroll Container

- The table is wrapped in `@reshet-ui/scroll-area` (styled, cross-browser scrollbar).
- `max-height: calc(100dvh - <header + form height>)` on the scroll area so the visible row count adapts to screen size.
- The `<thead>` row is **sticky** (`position: sticky; top: 0`) so column headers remain visible while scrolling.

### Columns (all sortable — asc ↕ desc)

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

Sorting is handled **client-side** via TanStack Table (bundled inside `@reshet-ui/data-table`) — no additional SAP requests on sort.

---

## Open Questions

| #   | Question                                             | Status             |
| --- | ---------------------------------------------------- | ------------------ |
| 1   | Exact endpoint path on the SAP server                | Not yet determined |
| 2   | Exact SAP query param names for each filter field    | Not yet determined |
| 3   | Exact JSON field names in each response row          | Not yet determined |
| 4   | Server-side record limit (max rows cap)              | Not yet determined |
| 5   | Permissions — accessible to all users or role-gated? | Not yet determined |
