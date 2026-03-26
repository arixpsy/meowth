import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAnalyticsStore } from '@/stores/analyticsStore'
import { useExpenseStore } from '@/stores/expenseStore'
import { useCollectionStore } from '@/stores/collectionStore'
import type { Expense } from '@/types/expense'
import type { Card } from '@/types/card'

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

function makeCard(overrides: Partial<Card> = {}): Omit<Card, 'id'> {
  return {
    pokemonTcgId: 'xy1-1',
    name: 'Pikachu',
    setName: 'XY',
    setId: 'xy1',
    number: '1',
    rarity: 'Common',
    imageUrl: '',
    marketPriceUsd: 1,
    marketPriceSgd: 10,
    isArtCollection: false,
    artValue: null,
    dateAdded: '2024-01-01',
    ...overrides,
  }
}

describe('analyticsStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  describe('profitLoss', () => {
    it('returns 0 when no cards and no expenses', () => {
      const store = useAnalyticsStore()
      expect(store.profitLoss).toBe(0)
    })

    it('equals collection totalValue minus expense totalSpent', () => {
      const expenseStore = useExpenseStore()
      const collectionStore = useCollectionStore()
      const analyticsStore = useAnalyticsStore()

      expenseStore.addExpense(makeExpense({ amount: 50 }))
      expenseStore.addExpense(makeExpense({ amount: 30 }))
      collectionStore.addCard(makeCard({ marketPriceSgd: 100 }))

      // totalValue = 100, totalSpent = 80, profitLoss = 20
      expect(analyticsStore.profitLoss).toBeCloseTo(20)
    })

    it('returns negative value when spent more than collection value', () => {
      const expenseStore = useExpenseStore()
      const collectionStore = useCollectionStore()
      const analyticsStore = useAnalyticsStore()

      expenseStore.addExpense(makeExpense({ amount: 200 }))
      collectionStore.addCard(makeCard({ marketPriceSgd: 50 }))

      expect(analyticsStore.profitLoss).toBeCloseTo(-150)
    })

    it('uses artValue for art collection cards in totalValue', () => {
      const expenseStore = useExpenseStore()
      const collectionStore = useCollectionStore()
      const analyticsStore = useAnalyticsStore()

      expenseStore.addExpense(makeExpense({ amount: 100 }))
      collectionStore.addCard(makeCard({ isArtCollection: true, artValue: 250, marketPriceSgd: 1 }))

      // totalValue = 250 (artValue), totalSpent = 100
      expect(analyticsStore.profitLoss).toBeCloseTo(150)
    })
  })

  describe('roi', () => {
    it('returns 0 when no spending', () => {
      const analyticsStore = useAnalyticsStore()
      expect(analyticsStore.roi).toBe(0)
    })

    it('returns (profitLoss / totalSpent) * 100', () => {
      const expenseStore = useExpenseStore()
      const collectionStore = useCollectionStore()
      const analyticsStore = useAnalyticsStore()

      expenseStore.addExpense(makeExpense({ amount: 100 }))
      collectionStore.addCard(makeCard({ marketPriceSgd: 150 }))

      // profitLoss = 50, totalSpent = 100, roi = 50%
      expect(analyticsStore.roi).toBeCloseTo(50)
    })

    it('returns negative ROI when at a loss', () => {
      const expenseStore = useExpenseStore()
      const collectionStore = useCollectionStore()
      const analyticsStore = useAnalyticsStore()

      expenseStore.addExpense(makeExpense({ amount: 100 }))
      collectionStore.addCard(makeCard({ marketPriceSgd: 60 }))

      // profitLoss = -40, totalSpent = 100, roi = -40%
      expect(analyticsStore.roi).toBeCloseTo(-40)
    })
  })

  describe('spendingOverTime', () => {
    it('returns empty array when no expenses', () => {
      const analyticsStore = useAnalyticsStore()
      expect(analyticsStore.spendingOverTime).toHaveLength(0)
    })

    it('returns cumulative monthly spending sorted chronologically', () => {
      const expenseStore = useExpenseStore()
      const analyticsStore = useAnalyticsStore()

      expenseStore.addExpense(makeExpense({ date: '2024-01-10', amount: 20 }))
      expenseStore.addExpense(makeExpense({ date: '2024-01-25', amount: 30 }))
      expenseStore.addExpense(makeExpense({ date: '2024-02-05', amount: 15 }))
      expenseStore.addExpense(makeExpense({ date: '2024-03-01', amount: 10 }))

      const result = analyticsStore.spendingOverTime
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({ month: '2024-01', cumulative: 50 })
      expect(result[1]).toEqual({ month: '2024-02', cumulative: 65 })
      expect(result[2]).toEqual({ month: '2024-03', cumulative: 75 })
    })

    it('returns array of { month, cumulative } objects', () => {
      const expenseStore = useExpenseStore()
      const analyticsStore = useAnalyticsStore()

      expenseStore.addExpense(makeExpense({ date: '2024-06-15', amount: 100 }))

      const result = analyticsStore.spendingOverTime
      expect(result[0]).toHaveProperty('month')
      expect(result[0]).toHaveProperty('cumulative')
      expect(result[0].month).toBe('2024-06')
      expect(result[0].cumulative).toBe(100)
    })
  })

  describe('valueOverTime', () => {
    it('returns empty array when no expenses', () => {
      const analyticsStore = useAnalyticsStore()
      expect(analyticsStore.valueOverTime).toHaveLength(0)
    })

    it('returns monthly snapshots of current collection value', () => {
      const expenseStore = useExpenseStore()
      const collectionStore = useCollectionStore()
      const analyticsStore = useAnalyticsStore()

      expenseStore.addExpense(makeExpense({ date: '2024-01-10', amount: 20 }))
      expenseStore.addExpense(makeExpense({ date: '2024-02-05', amount: 15 }))
      collectionStore.addCard(makeCard({ marketPriceSgd: 100 }))

      const result = analyticsStore.valueOverTime
      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('month')
      expect(result[0]).toHaveProperty('value')
      // All values show current total (v1 simplified approach)
      expect(result[0].value).toBe(100)
      expect(result[1].value).toBe(100)
    })

    it('returns array of { month, value } objects sorted chronologically', () => {
      const expenseStore = useExpenseStore()
      const analyticsStore = useAnalyticsStore()

      expenseStore.addExpense(makeExpense({ date: '2024-03-01', amount: 50 }))
      expenseStore.addExpense(makeExpense({ date: '2024-01-01', amount: 30 }))

      const result = analyticsStore.valueOverTime
      expect(result[0].month).toBe('2024-01')
      expect(result[1].month).toBe('2024-03')
    })
  })

  describe('insights', () => {
    it('returns null values when no data', () => {
      const analyticsStore = useAnalyticsStore()
      const insights = analyticsStore.insights
      expect(insights.mostValuableCard).toBeNull()
      expect(insights.biggestExpense).toBeNull()
      expect(insights.avgMonthlySpend).toBe(0)
      expect(insights.roi).toBe(0)
      expect(insights.topCategory).toBeNull()
    })

    it('mostValuableCard returns card with highest value', () => {
      const collectionStore = useCollectionStore()
      const analyticsStore = useAnalyticsStore()

      collectionStore.addCard(makeCard({ name: 'Cheap', marketPriceSgd: 10 }))
      collectionStore.addCard(makeCard({ name: 'Expensive', marketPriceSgd: 100 }))
      collectionStore.addCard(makeCard({ name: 'Mid', marketPriceSgd: 50 }))

      expect(analyticsStore.insights.mostValuableCard?.name).toBe('Expensive')
    })

    it('mostValuableCard uses artValue for art collection cards', () => {
      const collectionStore = useCollectionStore()
      const analyticsStore = useAnalyticsStore()

      collectionStore.addCard(makeCard({ name: 'Regular', marketPriceSgd: 100 }))
      collectionStore.addCard(makeCard({ name: 'Art', isArtCollection: true, artValue: 500, marketPriceSgd: 1 }))

      expect(analyticsStore.insights.mostValuableCard?.name).toBe('Art')
    })

    it('biggestExpense returns expense with highest amount', () => {
      const expenseStore = useExpenseStore()
      const analyticsStore = useAnalyticsStore()

      expenseStore.addExpense(makeExpense({ itemName: 'Small', amount: 20 }))
      expenseStore.addExpense(makeExpense({ itemName: 'Large', amount: 200 }))
      expenseStore.addExpense(makeExpense({ itemName: 'Medium', amount: 80 }))

      expect(analyticsStore.insights.biggestExpense?.itemName).toBe('Large')
    })

    it('avgMonthlySpend = totalSpent / number of unique months', () => {
      const expenseStore = useExpenseStore()
      const analyticsStore = useAnalyticsStore()

      expenseStore.addExpense(makeExpense({ date: '2024-01-10', amount: 100 }))
      expenseStore.addExpense(makeExpense({ date: '2024-01-20', amount: 50 }))
      expenseStore.addExpense(makeExpense({ date: '2024-02-05', amount: 30 }))

      // totalSpent = 180, unique months = 2, avg = 90
      expect(analyticsStore.insights.avgMonthlySpend).toBeCloseTo(90)
    })

    it('avgMonthlySpend is 0 when no expenses', () => {
      const analyticsStore = useAnalyticsStore()
      expect(analyticsStore.insights.avgMonthlySpend).toBe(0)
    })

    it('roi matches the roi getter', () => {
      const expenseStore = useExpenseStore()
      const collectionStore = useCollectionStore()
      const analyticsStore = useAnalyticsStore()

      expenseStore.addExpense(makeExpense({ amount: 100 }))
      collectionStore.addCard(makeCard({ marketPriceSgd: 150 }))

      expect(analyticsStore.insights.roi).toBeCloseTo(analyticsStore.roi)
    })

    it('topCategory returns the category with highest total spending', () => {
      const expenseStore = useExpenseStore()
      const analyticsStore = useAnalyticsStore()

      expenseStore.addExpense(makeExpense({ category: 'singles', amount: 50 }))
      expenseStore.addExpense(makeExpense({ category: 'sealed', amount: 200 }))
      expenseStore.addExpense(makeExpense({ category: 'singles', amount: 30 }))

      // sealed = 200, singles = 80
      expect(analyticsStore.insights.topCategory).toBe('sealed')
    })

    it('topCategory is null when no expenses', () => {
      const analyticsStore = useAnalyticsStore()
      expect(analyticsStore.insights.topCategory).toBeNull()
    })
  })
})
