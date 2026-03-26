import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { v4 as uuid } from 'uuid'
import type { Expense, ExpenseCategory } from '@/types/expense'
import { EXPENSE_CATEGORIES } from '@/types/expense'
import { storage } from '@/services/storage'

export const useExpenseStore = defineStore('expenses', () => {
  const expenses = ref<Expense[]>(storage.getExpenses())

  function addExpense(data: Omit<Expense, 'id'>): void {
    const expense: Expense = { id: uuid(), ...data }
    expenses.value.push(expense)
    storage.saveExpenses(expenses.value)
  }

  function updateExpense(id: string, data: Partial<Expense>): void {
    const index = expenses.value.findIndex((e) => e.id === id)
    if (index === -1) return
    expenses.value[index] = { ...expenses.value[index], ...data } as Expense
    storage.saveExpenses(expenses.value)
  }

  function deleteExpense(id: string): void {
    expenses.value = expenses.value.filter((e) => e.id !== id)
    storage.saveExpenses(expenses.value)
  }

  const totalSpent = computed<number>(() =>
    expenses.value.reduce((sum, e) => sum + e.amount, 0),
  )

  const spentByCategory = computed<Record<ExpenseCategory, number>>(() => {
    const result = Object.fromEntries(
      EXPENSE_CATEGORIES.map((cat) => [cat, 0]),
    ) as Record<ExpenseCategory, number>
    for (const expense of expenses.value) {
      result[expense.category] += expense.amount
    }
    return result
  })

  const recentExpenses = computed<Expense[]>(() =>
    [...expenses.value].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
  )

  const monthlySpending = computed<Array<{ month: string } & Record<ExpenseCategory, number>>>(
    () => {
      const map = new Map<string, Record<ExpenseCategory, number>>()

      for (const expense of expenses.value) {
        const month = expense.date.slice(0, 7) // YYYY-MM
        if (!map.has(month)) {
          map.set(
            month,
            Object.fromEntries(EXPENSE_CATEGORIES.map((cat) => [cat, 0])) as Record<
              ExpenseCategory,
              number
            >,
          )
        }
        map.get(month)![expense.category] += expense.amount
      }

      return Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, amounts]) => ({ month, ...amounts }))
    },
  )

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    totalSpent,
    spentByCategory,
    recentExpenses,
    monthlySpending,
  }
})
