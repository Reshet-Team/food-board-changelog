import * as z from 'zod/v4'

// ─── Search Filter ──────────────────────────────────────────────────────────
// Drives both the form state and the SAP API request params.

export interface FoodLogsFilter {
  // Mandatory
  foodBoard: string // STNUM  — Food Board number
  alternative: string // ALTNR  — Alternative number
  dateFrom: Date // DATUM  — From Change Date. Default: yesterday.

  // Optional
  dateTo?: Date // DATUM  — To Change Date. Default: today.
  //          Range cannot exceed 6 months from dateFrom.
  material?: string[] // MATNR  — One or more material numbers (zero-padded CHAR18)
  consumptionDateFrom?: Date // DATUM  — From consumption date
  consumptionDateTo?: Date // DATUM  — To consumption date
  changedBy?: string[] // USNAM  — One or more usernames who made the change
}

// ─── Alternative option (dropdown choice) ────────────────────────────────────
// One selectable alternative (ALTNR) returned by the alternatives API.

export interface AlternativeOption {
  value: string // ALTNR — Alternative number (e.g. "04")
  label: string // Human-readable description shown in the dropdown
}

// ─── Food Log Record (one table row) ────────────────────────────────────────
// Represents a single change-log entry returned by SAP.

export interface FoodLog {
  typeOfChange: string // DDTEXT    — Description of the change type
  material: string // MATNR     — Material number (CHAR18, zero-padded)
  quantity: number // KMPMG     — Component quantity
  consumptionDate: string // DATUM     — Consumption date (YYYYMMDD)
  dayInPeriod: number // CIM_COUNT — Day counter within the period
  changeDate: string // DATUM     — Date of change (YYYYMMDD)
  changeTime: string // UZEIT     — Time of change (HHMMSS)
  changedBy: string // USNAM     — Username who made the change
  field: string // FIELDNAME — Name of the changed field
  oldValue: string // CDFLDVALO — Value before the change
  newValue: string // CDFLDVALO — Value after the change
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
