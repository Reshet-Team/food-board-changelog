# Food Logs Screen — Phase 4: Search Form

## Route File (`src/routes/food-logs.tsx`)

- Registered automatically by TanStack Router's file-based discovery.
- URL: `/food-logs`
- Declares the **search params schema** (Zod) so filter state lives in the URL — making results bookmarkable and shareable.
- No business logic inline — only wires the route's search params into `FoodLogsPage`.

```ts
import { createFileRoute } from '@tanstack/react-router'
import { foodLogsSearchSchema } from '@/features/foodLogs/types/foodLog'
import { FoodLogsPage } from '@/features/foodLogs/components/FoodLogsPage/FoodLogsPage'

export const Route = createFileRoute('/food-logs')({
  validateSearch: foodLogsSearchSchema,
  component: FoodLogsPage,
})
```

### URL state behaviour

- Refreshing the page preserves the last search.
- The URL can be copied and shared to reproduce an identical search.
- The browser back button restores the previous search.

---

## `FoodLogsSearchForm` Component

### Form library: UniForm (`@uniform-ts/core`)

The search form is built with UniForm — a headless, Zod-driven form library. The workflow is:

1. The `foodLogsSearchSchema` (defined in Phase 2) is the **single source of truth** for field shapes, types, defaults, and validation.
2. Wrap it: `const searchForm = createForm(foodLogsSearchSchema)`.
3. Render: `<AutoForm form={searchForm} onSubmit={handleSearch} components={reshetComponents} />`.
4. Supply a `components` registry that maps Zod primitive types to Reshet UI components (`string` → `@reshet-ui/input`, DATUM/date fields → `@reshet-ui/date-picker`).
5. Use `fields` overrides to set per-field `label`, `required`, and the `type="time"` attribute on `changeTime`.

This keeps all form state and validation in the schema — no manual `register()`, `watch()`, or `useForm` boilerplate.

---

### Mandatory fields (submit blocked if any are empty)

| Label            | Field key     | ABAP Type | Reshet UI component      |
| ---------------- | ------------- | --------- | ------------------------ |
| לוח מזון \*      | `foodBoard`   | `STNUM`   | `@reshet-ui/input`       |
| חלופה \*         | `alternative` | `ALTNR`   | `@reshet-ui/input`       |
| מתאריכו שינוי \* | `dateFrom`    | `DATUM`   | `@reshet-ui/date-picker` |

### Optional fields

| Label           | Field key         | ABAP Type | Reshet UI component                   | Notes                                                                                                                                   |
| --------------- | ----------------- | --------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| עד תאריכו שינוי | `dateTo`          | `DATUM`   | `@reshet-ui/date-picker`              | Default: today. Max 6 months from `dateFrom`.                                                                                           |
| חומר            | `material`        | `MATNR`   | `@reshet-ui/input`                    |                                                                                                                                         |
| תאריך צריכה     | `consumptionDate` | `DATUM`   | `@reshet-ui/date-picker`              |                                                                                                                                         |
| שעת שינוי       | `changeTime`      | `UZEIT`   | `@reshet-ui/input` with `type="time"` | No Reshet UI time picker exists. Native `<input type="time">` returns `HH:MM`; append `":00"` → strip colons to build `HHMMSS` for SAP. |
| שונה ע"י        | `changedBy`       | `USNAM`   | `@reshet-ui/input`                    |                                                                                                                                         |

---

### Field wrapper & layout

- Each input is wrapped in `@reshet-ui/field` which provides the `<label>`, required indicator (`*`), description slot, and inline error message.
- The date range pair (From / To) is grouped under a single `@reshet-ui/fieldset`.
- Form actions use `@reshet-ui/button`:
  - **חפש** (Search) — primary, disabled while mandatory fields are empty or a fetch is in-flight. Shows `@reshet-ui/spinner` inside the button during fetch.
  - **איפוס** (Reset) — secondary, restores defaults (`dateFrom` = yesterday, `dateTo` = today, all other fields cleared).

### Submit behaviour

1. UniForm's `onSubmit` fires only when the Zod schema validates.
2. The handler additionally checks that `dateTo − dateFrom ≤ 6 months`; if not, it sets a field-level error on `dateTo` and aborts.
3. On valid submit: `router.navigate({ search: formValues })` — updates URL params and triggers the TanStack Query.
