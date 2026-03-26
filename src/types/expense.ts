export const EXPENSE_CATEGORIES = ['sealed', 'singles', 'supplies', 'art-supplies', 'others'] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export interface Expense {
  id: string
  itemName: string
  category: ExpenseCategory
  amount: number // SGD
  date: string // ISO date string YYYY-MM-DD
  notes: string
}

export const CATEGORY_CONFIG: Record<ExpenseCategory, { label: string; color: string }> = {
  sealed: { label: 'Sealed Product', color: '#c44033' },
  singles: { label: 'Singles', color: '#2d5a27' },
  supplies: { label: 'Supplies', color: '#5b7bd5' },
  'art-supplies': { label: 'Art Supplies', color: '#b8860b' },
  others: { label: 'Others', color: '#9a9a9a' },
}
