import { foodLogsSearchSchema, type FoodLogsSearchParams } from '@/features/foodLogs/types/foodLog'
import { atom } from 'jotai'

export const defaultFoodLogsFilter: FoodLogsSearchParams = foodLogsSearchSchema.parse({})

export const foodLogsFilterAtom = atom<FoodLogsSearchParams>(defaultFoodLogsFilter)
