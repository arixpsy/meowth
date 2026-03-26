import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useExpenseStore } from './expenseStore'
import { useCollectionStore } from './collectionStore'
import type { ExpenseCategory } from '@/types/expense'

export const useAnalyticsStore = defineStore('analytics', () => {
  const expenseStore = useExpenseStore()
  const collectionStore = useCollectionStore()

  const profitLoss = computed<number>(
    () => collectionStore.totalValue - expenseStore.totalSpent,
  )

  const roi = computed<number>(() => {
    const totalSpent = expenseStore.totalSpent
    return totalSpent > 0 ? (profitLoss.value / totalSpent) * 100 : 0
  })

  const spendingOverTime = computed<Array<{ month: string; cumulative: number }>>(() => {
    const monthlyMap = new Map<string, number>()

    for (const expense of expenseStore.expenses) {
      const month = expense.date.slice(0, 7) // YYYY-MM
      monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + expense.amount)
    }

    const sortedMonths = Array.from(monthlyMap.keys()).sort()
    let cumulative = 0
    return sortedMonths.map((month) => {
      cumulative += monthlyMap.get(month)!
      return { month, cumulative }
    })
  })

  const valueOverTime = computed<Array<{ month: string; value: number }>>(() => {
    const monthSet = new Set<string>()
    for (const expense of expenseStore.expenses) {
      monthSet.add(expense.date.slice(0, 7))
    }

    const currentValue = collectionStore.totalValue
    return Array.from(monthSet)
      .sort()
      .map((month) => ({ month, value: currentValue }))
  })

  function cardValue(card: { isArtCollection: boolean; artValue: number | null; marketPriceSgd: number }): number {
    return card.isArtCollection ? (card.artValue ?? 0) : card.marketPriceSgd
  }

  const insights = computed(() => {
    const cards = collectionStore.cards
    const expenses = expenseStore.expenses

    // mostValuableCard: card with highest effective value
    const mostValuableCard =
      cards.length > 0
        ? cards.reduce((best, card) => (cardValue(card) > cardValue(best) ? card : best))
        : null

    // biggestExpense: expense with highest amount
    const biggestExpense =
      expenses.length > 0
        ? expenses.reduce((best, expense) => (expense.amount > best.amount ? expense : best))
        : null

    // avgMonthlySpend: totalSpent / number of unique months
    const uniqueMonths = new Set(expenses.map((e) => e.date.slice(0, 7)))
    const avgMonthlySpend =
      uniqueMonths.size > 0 ? expenseStore.totalSpent / uniqueMonths.size : 0

    // topCategory: the category with highest total spending
    const categoryTotals = expenseStore.spentByCategory
    let topCategory: ExpenseCategory | null = null
    if (expenses.length > 0) {
      topCategory = (Object.entries(categoryTotals) as [ExpenseCategory, number][]).reduce(
        (best, [cat, amount]) => (amount > categoryTotals[best] ? cat : best),
        Object.keys(categoryTotals)[0] as ExpenseCategory,
      )
    }

    return {
      mostValuableCard,
      biggestExpense,
      avgMonthlySpend,
      roi: roi.value,
      topCategory,
    }
  })

  return {
    profitLoss,
    roi,
    spendingOverTime,
    valueOverTime,
    insights,
  }
})
