import * as z from 'zod/v4'

// ─── Search Filter ──────────────────────────────────────────────────────────
// Drives both the form state and the SAP API request params.

export interface FoodLogsFilter {
  // Mandatory
  foodBoard: string // STNUM  — Food Board number
  alternative: string // ALTNR  — Alternative number
  dateFrom: Date // DATUM  — From Change Date. Default: yesterday.
  dateTo: Date // DATUM  — To Change Date. Default: today.
  //          Range cannot exceed 6 months from dateFrom.

  // Optional
  material?: string[] // MATNR  — One or more material numbers (zero-padded CHAR18)
  consumptionDateFrom?: Date // DATUM  — From consumption date
  consumptionDateTo?: Date // DATUM  — To consumption date
  changedBy?: string[] // USNAM  — One or more usernames who made the change
}

// ─── Alternative option (dropdown choice) ────────────────────────────────────
// One selectable alternative returned by the alternatives API. There are ~100
// alternatives but only a handful of types; each alternative carries its type
// value (numeric code) and a human-readable type description. The dropdown
// shows the value and the type description.

export interface AlternativeOption {
  value: string // ALTNR — Alternative number (e.g. "04")
  typeValue: string // Type code that groups alternatives (e.g. "4", "6")
  typeDescription: string // Human-readable type shown next to the value (e.g. "יומית")
}

// ─── Food Log Record (one table row) ────────────────────────────────────────
// Represents a single change-log entry returned by SAP. Date fields are parsed
// into real `Date` objects at the API boundary (see utils/parseFoodLog); the
// raw SAP wire shape, with YYYYMMDD strings, is `RawFoodLog` below.

export interface FoodLog {
  typeOfChange: string // CHANGE_IND — Change-document indicator code (I/J/U/D/E)
  material: string // MATNR     — Material number (CHAR18, zero-padded)
  quantity: number // KMPMG     — Component quantity
  consumptionDate?: Date // DATUM     — Consumption date. Optional — may be absent.
  dayInPeriod?: number // CIM_COUNT — Day counter within the period. Optional — may be absent.
  changeDate: Date // DATUM + UZEIT — Full change timestamp (date + time-of-day).
  changedBy: string // USNAM     — Username who made the change
  field: string // FIELDNAME — Name of the changed field
  oldValue: string // CDFLDVALO — Value before the change
  newValue: string // CDFLDVALN — Value after the change
}

// ─── Raw Food Log Record (SAP wire shape) ───────────────────────────────────
// Exactly what SAP returns over the wire: date fields are YYYYMMDD strings.
// `toFoodLog` (utils/parseFoodLog) converts this into the `FoodLog` above.

export interface RawFoodLog {
  typeOfChange: string
  material: string
  quantity: number
  consumptionDate?: string // DATUM — YYYYMMDD
  dayInPeriod?: number
  changeDate: string // DATUM — YYYYMMDD
  changeTime: string // UZEIT — HHMMSS
  changedBy: string
  field: string
  oldValue: string
  newValue: string
}

// ─── Search Params Schema (URL state + form validation) ──────────────────────
// Single source of truth for the search form fields, their types, and defaults.
// Used by TanStack Router to validate URL search params and by UniForm to
// render the search form.

export const foodLogsSearchSchema = z.object({
  foodBoard: z.string().regex(/^\d*$/, 'מספרים בלבד').default(''),
  alternative: z
    .string()
    .regex(/^\d{0,2}$/, 'מספרים בלבד, עד 2 ספרות')
    .default(''),
  dateFrom: z.coerce.date().default(() => new Date(Date.now() - 864e5)),
  dateTo: z.coerce.date().default(() => new Date()),
  material: z.array(z.string().regex(/^\d+$/, 'מספרים בלבד')).optional(),
  consumptionDateFrom: z.coerce.date().optional(),
  consumptionDateTo: z.coerce.date().optional(),
  changedBy: z.array(z.string()).optional(),
})

export type FoodLogsSearchParams = z.infer<typeof foodLogsSearchSchema>
