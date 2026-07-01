export type ChangeType = 'add' | 'delete' | 'update'

export const CHANGE_TYPE_OPTIONS: { value: ChangeType; label: string }[] = [
  { value: 'add', label: 'הוספה' },
  { value: 'delete', label: 'מחיקה' },
  { value: 'update', label: 'עדכון' },
]

export const ALL_CHANGE_TYPES: ChangeType[] = ['add', 'delete', 'update']

const CHANGE_TYPE_LABEL: Record<ChangeType, string> = {
  add: 'הוספה',
  delete: 'מחיקה',
  update: 'עדכון',
}

export function classifyChangeType(code: string): ChangeType {
  const normalized = code.trim().toUpperCase()
  if (normalized === 'I' || normalized === 'J') return 'add'
  if (normalized === 'D' || normalized === 'E') return 'delete'
  return 'update'
}

export function changeTypeLabel(code: string): string {
  return CHANGE_TYPE_LABEL[classifyChangeType(code)]
}

export function matchesChangeTypes(code: string, selected: ChangeType[]): boolean {
  return selected.includes(classifyChangeType(code))
}
