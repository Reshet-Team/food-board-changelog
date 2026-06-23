// ─── Change-type local filter ────────────────────────────────────────────────
// The change-type checkboxes filter the rows *after* they arrive from SAP —
// they never become part of the API request. SAP delivers the change as a
// single-letter change-document indicator code; we translate it into one of
// three categories (and a Hebrew label) for display, colouring, and filtering.

export type ChangeType = 'add' | 'delete' | 'update'

export const CHANGE_TYPE_OPTIONS: { value: ChangeType; label: string }[] = [
  { value: 'add', label: 'הוספה' },
  { value: 'delete', label: 'מחיקה' },
  { value: 'update', label: 'עדכון' },
]

// Every change type, used as the default "show everything" selection.
export const ALL_CHANGE_TYPES: ChangeType[] = ['add', 'delete', 'update']

// Hebrew display label for each category.
const CHANGE_TYPE_LABEL: Record<ChangeType, string> = {
  add: 'הוספה',
  delete: 'מחיקה',
  update: 'עדכון',
}

/**
 * Maps a raw SAP change-document indicator code to its category:
 * `I`/`J` → insert (add), `D`/`E` → delete, `U` (and anything else) → update.
 */
export function classifyChangeType(code: string): ChangeType {
  const normalized = code.trim().toUpperCase()
  if (normalized === 'I' || normalized === 'J') return 'add'
  if (normalized === 'D' || normalized === 'E') return 'delete'
  return 'update'
}

/** Translates a raw change-type code into its Hebrew display label. */
export function changeTypeLabel(code: string): string {
  return CHANGE_TYPE_LABEL[classifyChangeType(code)]
}

/** Returns true when a row's change type is among the selected categories. */
export function matchesChangeTypes(code: string, selected: ChangeType[]): boolean {
  return selected.includes(classifyChangeType(code))
}
