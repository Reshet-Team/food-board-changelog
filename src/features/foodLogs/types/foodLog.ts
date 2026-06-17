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
