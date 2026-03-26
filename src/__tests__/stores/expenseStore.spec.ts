import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useExpenseStore } from '@/stores/expenseStore'
import type { Expense } from '@/types/expense'
import { EXPENSE_CATEGORIES } from '@/types/expense'

function makeExpense(overrides: Partial<Expense> = {}): Omit<Expense, 'id'> {
  return {
    itemName: 'Test Item',
    category: 'singles',
    amount: 10,
    date: '2024-01-15',
    notes: '',
    ...overrides,
  }
}

describe('expenseStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  describe('addExpense', () => {
    it('adds an expense to the list', () => {
      const store = useExpenseStore()
      store.addExpense(makeExpense())
      expect(store.expenses).toHaveLength(1)
      expect(store.expenses[0].itemName).toBe('Test Item')
    })

    it('generates a unique id for each expense', () => {
      const store = useExpenseStore()
      store.addExpense(makeExpense())
      store.addExpense(makeExpense())
      expect(store.expenses[0].id).toBeTruthy()
      expect(store.expenses[0].id).not.toBe(store.expenses[1].id)
    })

    it('persists to storage after adding', () => {
      const store = useExpenseStore()
      store.addExpense(makeExpense({ itemName: 'Persisted Item' }))
      const raw = localStorage.getItem('meowth_expenses')
      expect(raw).not.toBeNull()
      const parsed = JSON.parse(raw!)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].itemName).toBe('Persisted Item')
    })
  })

  describe('updateExpense', () => {
    it('modifies an existing expense by id', () => {
      const store = useExpenseStore()
      store.addExpense(makeExpense({ itemName: 'Original' }))
      const id = store.expenses[0].id
      store.updateExpense(id, { itemName: 'Updated', amount: 99 })
      expect(store.expenses[0].itemName).toBe('Updated')
      expect(store.expenses[0].amount).toBe(99)
    })

    it('preserves other fields when updating', () => {
      const store = useExpenseStore()
      store.addExpense(makeExpense({ category: 'sealed', amount: 50 }))
      const id = store.expenses[0].id
      store.updateExpense(id, { amount: 75 })
      expect(store.expenses[0].category).toBe('sealed')
      expect(store.expenses[0].amount).toBe(75)
    })

    it('persists to storage after updating', () => {
      const store = useExpenseStore()
      store.addExpense(makeExpense())
      const id = store.expenses[0].id
      store.updateExpense(id, { itemName: 'Updated' })
      const raw = localStorage.getItem('meowth_expenses')
      const parsed = JSON.parse(raw!)
      expect(parsed[0].itemName).toBe('Updated')
    })

    it('does nothing if id not found', () => {
      const store = useExpenseStore()
      store.addExpense(makeExpense())
      store.updateExpense('nonexistent-id', { itemName: 'Should Not Apply' })
      expect(store.expenses[0].itemName).toBe('Test Item')
    })
  })

  describe('deleteExpense', () => {
    it('removes expense by id', () => {
      const store = useExpenseStore()
      store.addExpense(makeExpense({ itemName: 'A' }))
      store.addExpense(makeExpense({ itemName: 'B' }))
      const idToDelete = store.expenses[0].id
      store.deleteExpense(idToDelete)
      expect(store.expenses).toHaveLength(1)
      expect(store.expenses[0].itemName).toBe('B')
    })

    it('persists to storage after deleting', () => {
      const store = useExpenseStore()
      store.addExpense(makeExpense())
      const id = store.expenses[0].id
      store.deleteExpense(id)
      const raw = localStorage.getItem('meowth_expenses')
      const parsed = JSON.parse(raw!)
      expect(parsed).toHaveLength(0)
    })
  })

  describe('totalSpent', () => {
    it('returns 0 when no expenses', () => {
      const store = useExpenseStore()
      expect(store.totalSpent).toBe(0)
    })

    it('sums all expense amounts', () => {
      const store = useExpenseStore()
      store.addExpense(makeExpense({ amount: 10 }))
      store.addExpense(makeExpense({ amount: 25.5 }))
      store.addExpense(makeExpense({ amount: 14.5 }))
      expect(store.totalSpent).toBe(50)
    })
  })

  describe('spentByCategory', () => {
    it('returns all categories with default 0', () => {
      const store = useExpenseStore()
      const result = store.spentByCategory
      for (const cat of EXPENSE_CATEGORIES) {
        expect(result[cat]).toBe(0)
      }
    })

    it('accumulates amounts by category', () => {
      const store = useExpenseStore()
      store.addExpense(makeExpense({ category: 'sealed', amount: 20 }))
      store.addExpense(makeExpense({ category: 'sealed', amount: 30 }))
      store.addExpense(makeExpense({ category: 'singles', amount: 15 }))
      const result = store.spentByCategory
      expect(result.sealed).toBe(50)
      expect(result.singles).toBe(15)
      expect(result.supplies).toBe(0)
    })
  })

  describe('recentExpenses', () => {
    it('returns empty array when no expenses', () => {
      const store = useExpenseStore()
      expect(store.recentExpenses).toHaveLength(0)
    })

    it('returns last 5 sorted by date descending', () => {
      const store = useExpenseStore()
      const dates = [
        '2024-01-01',
        '2024-01-05',
        '2024-01-03',
        '2024-01-07',
        '2024-01-02',
        '2024-01-06',
      ]
      for (const date of dates) {
        store.addExpense(makeExpense({ date }))
      }
      const recent = store.recentExpenses
      expect(recent).toHaveLength(5)
      expect(recent[0].date).toBe('2024-01-07')
      expect(recent[1].date).toBe('2024-01-06')
      expect(recent[2].date).toBe('2024-01-05')
      expect(recent[3].date).toBe('2024-01-03')
      expect(recent[4].date).toBe('2024-01-02')
    })

    it('returns all expenses if 5 or fewer', () => {
      const store = useExpenseStore()
      store.addExpense(makeExpense({ date: '2024-01-01' }))
      store.addExpense(makeExpense({ date: '2024-01-02' }))
      expect(store.recentExpenses).toHaveLength(2)
    })
  })

  describe('monthlySpending', () => {
    it('returns empty array when no expenses', () => {
      const store = useExpenseStore()
      expect(store.monthlySpending).toHaveLength(0)
    })

    it('groups expenses by YYYY-MM month', () => {
      const store = useExpenseStore()
      store.addExpense(makeExpense({ date: '2024-01-10', category: 'singles', amount: 20 }))
      store.addExpense(makeExpense({ date: '2024-01-20', category: 'sealed', amount: 30 }))
      store.addExpense(makeExpense({ date: '2024-02-05', category: 'singles', amount: 15 }))
      const result = store.monthlySpending
      expect(result).toHaveLength(2)
      const jan = result.find((r) => r.month === '2024-01')
      expect(jan).toBeDefined()
      expect(jan!.singles).toBe(20)
      expect(jan!.sealed).toBe(30)
      const feb = result.find((r) => r.month === '2024-02')
      expect(feb).toBeDefined()
      expect(feb!.singles).toBe(15)
    })
  })

  describe('initial load from storage', () => {
    it('loads existing expenses from localStorage on creation', () => {
      const existing: Expense[] = [
        {
          id: 'existing-1',
          itemName: 'Pre-existing Card',
          category: 'singles',
          amount: 100,
          date: '2024-01-01',
          notes: 'loaded from storage',
        },
      ]
      localStorage.setItem('meowth_expenses', JSON.stringify(existing))

      // Create a fresh store — it should load from storage
      setActivePinia(createPinia())
      const store = useExpenseStore()
      expect(store.expenses).toHaveLength(1)
      expect(store.expenses[0].id).toBe('existing-1')
      expect(store.expenses[0].itemName).toBe('Pre-existing Card')
    })
  })
})
