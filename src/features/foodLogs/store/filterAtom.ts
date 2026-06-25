import { foodLogsSearchSchema, type FoodLogsSearchParams } from '@/features/foodLogs/types/foodLog'
import { atom } from 'jotai'

// ─── Filter state (replaces URL search params) ──────────────────────────────
// The active search filter now lives in a Jotai atom instead of the URL. Like
// the previous "clear on hard refresh" behaviour, this in-memory state resets
// to its defaults whenever the page is reloaded.

// The default filter — every field at its schema default (empty mandatory
// fields, yesterday→today date range, no optional filters).
export const defaultFoodLogsFilter: FoodLogsSearchParams = foodLogsSearchSchema.parse({})

export const foodLogsFilterAtom = atom<FoodLogsSearchParams>(defaultFoodLogsFilter)
