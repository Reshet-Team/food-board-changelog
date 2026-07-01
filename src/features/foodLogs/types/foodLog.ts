import * as z from 'zod/v4'

export interface FoodLogsFilter {
  foodBoard: string
  alternative: string
  dateFrom: Date
  dateTo: Date

  material?: string[]
  consumptionDateFrom?: Date
  consumptionDateTo?: Date
  changedBy?: string[]
}

export interface AlternativeOption {
  value: string
  typeValue: string
  typeDescription: string
}

export interface FoodLog {
  typeOfChange: string
  material: string
  quantity: number
  consumptionDate?: Date
  dayInPeriod?: number
  changeDate: Date
  changedBy: string
  field: string
  oldValue: string
  newValue: string
}

export interface RawFoodLog {
  typeOfChange: string
  material: string
  quantity: number
  consumptionDate?: string
  dayInPeriod?: number
  changeDate: string
  changeTime: string
  changedBy: string
  field: string
  oldValue: string
  newValue: string
}

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
