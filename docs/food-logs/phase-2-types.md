# Food Logs Screen — Phase 2: Types & Data Layer

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

## TypeScript Interfaces (`types/foodLog.ts`)

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
  typeOfChange: string // DDTEXT    — Description of the change type
  material: string // MATNR     — Material number (CHAR18, zero-padded)
  quantity: number // KMPMG     — Component quantity (native JSON number)
  consumptionDate: string // DATUM     — Consumption date (YYYYMMDD)
  dayInPeriod: number // CIM_COUNT — Day counter within the period (native JSON number)
  changeDate: string // DATUM     — Date of change (YYYYMMDD)
  changeTime: string // UZEIT     — Time of change (HHMMSS)
  changedBy: string // USNAM     — Username who made the change
  field: string // FIELDNAME — Name of the changed field
  oldValue: string // CDFLDVALO — Value before the change
  newValue: string // CDFLDVALO — Value after the change
}
```

---

## Zod Search Schema (`types/foodLog.ts`)

The same file exports the Zod schema used both for URL search param validation (in the route) and for UniForm's form definition:

```ts
import * as z from 'zod/v4'

// Helper functions — implement in src/utils/date.ts
// yesterdayYYYYMMDD() → e.g. "20260615"
// todayYYYYMMDD()     → e.g. "20260616"

export const foodLogsSearchSchema = z.object({
  foodBoard: z.string().default(''),
  alternative: z.string().default(''),
  dateFrom: z.string().default(yesterdayYYYYMMDD()),
  dateTo: z.string().default(todayYYYYMMDD()),
  material: z.string().optional(),
  consumptionDate: z.string().optional(),
  changeTime: z.string().optional(),
  changedBy: z.string().optional(),
})

export type FoodLogsSearchParams = z.infer<typeof foodLogsSearchSchema>
```

**Date range validation rule:** `dateTo` must be within 6 months of `dateFrom`. This is enforced in the form `onSubmit` handler (not at the Zod schema level) to allow a more descriptive error message.
