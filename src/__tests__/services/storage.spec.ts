import { describe, it, expect, beforeEach } from 'vitest'
import { storage } from '@/services/storage'

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('expenses', () => {
    it('returns empty array when no expenses stored', () => {
      expect(storage.getExpenses()).toEqual([])
    })

    it('round-trips expense data', () => {
      const expenses = [{ id: '1', itemName: 'Test', category: 'sealed' as const, amount: 10, date: '2026-01-01', notes: '' }]
      storage.saveExpenses(expenses)
      expect(storage.getExpenses()).toEqual(expenses)
    })
  })

  describe('cards', () => {
    it('returns empty array when no cards stored', () => {
      expect(storage.getCards()).toEqual([])
    })

    it('round-trips card data', () => {
      const cards = [{ id: '1', pokemonTcgId: 'xy1-1', name: 'Test', setName: 'XY', setId: 'xy1', number: '1', rarity: 'Common', imageUrl: '', marketPriceUsd: 1, marketPriceSgd: 1.35, isArtCollection: false, artValue: null, dateAdded: '2026-01-01' }]
      storage.saveCards(cards)
      expect(storage.getCards()).toEqual(cards)
    })
  })

  describe('exchange rate', () => {
    it('returns null when no rate cached', () => {
      expect(storage.getExchangeRate()).toBeNull()
    })

    it('round-trips exchange rate with timestamp', () => {
      const rate = { rate: 1.35, timestamp: Date.now() }
      storage.saveExchangeRate(rate)
      expect(storage.getExchangeRate()).toEqual(rate)
    })
  })
})
