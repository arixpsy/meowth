import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCollectionStore } from '@/stores/collectionStore'
import type { Card } from '@/types/card'

function makeCard(overrides: Partial<Card> & { id: string; setName: string }): Card {
  return {
    pokemonTcgId: 'xy1-1',
    name: 'Pikachu',
    setId: 'xy1',
    number: '1',
    rarity: 'Common',
    imageUrl: '',
    marketPriceUsd: 1,
    marketPriceSgd: 1.35,
    isArtCollection: false,
    artValue: null,
    dateAdded: '2026-01-01',
    ...overrides,
  }
}

describe('collectionStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  describe('addCard', () => {
    it('adds card to list', () => {
      const store = useCollectionStore()
      const data: Omit<Card, 'id'> = {
        pokemonTcgId: 'xy1-1',
        name: 'Pikachu',
        setName: 'XY',
        setId: 'xy1',
        number: '1',
        rarity: 'Common',
        imageUrl: '',
        marketPriceUsd: 1,
        marketPriceSgd: 1.35,
        isArtCollection: false,
        artValue: null,
        dateAdded: '2026-01-01',
      }
      store.addCard(data)
      expect(store.cards).toHaveLength(1)
      expect(store.cards[0].name).toBe('Pikachu')
      expect(store.cards[0].id).toBeTruthy()
    })

    it('persists card to localStorage', () => {
      const store = useCollectionStore()
      store.addCard({
        pokemonTcgId: 'xy1-1',
        name: 'Pikachu',
        setName: 'XY',
        setId: 'xy1',
        number: '1',
        rarity: 'Common',
        imageUrl: '',
        marketPriceUsd: 1,
        marketPriceSgd: 1.35,
        isArtCollection: false,
        artValue: null,
        dateAdded: '2026-01-01',
      })
      const stored = JSON.parse(localStorage.getItem('meowth_cards') ?? '[]')
      expect(stored).toHaveLength(1)
      expect(stored[0].name).toBe('Pikachu')
    })
  })

  describe('updateCard', () => {
    it('modifies existing card by id', () => {
      const store = useCollectionStore()
      store.addCard({
        pokemonTcgId: 'xy1-1',
        name: 'Pikachu',
        setName: 'XY',
        setId: 'xy1',
        number: '1',
        rarity: 'Common',
        imageUrl: '',
        marketPriceUsd: 1,
        marketPriceSgd: 1.35,
        isArtCollection: false,
        artValue: null,
        dateAdded: '2026-01-01',
      })
      const id = store.cards[0].id
      store.updateCard(id, { name: 'Raichu', marketPriceSgd: 5.0 })
      expect(store.cards[0].name).toBe('Raichu')
      expect(store.cards[0].marketPriceSgd).toBe(5.0)
    })

    it('persists update to localStorage', () => {
      const store = useCollectionStore()
      store.addCard({
        pokemonTcgId: 'xy1-1',
        name: 'Pikachu',
        setName: 'XY',
        setId: 'xy1',
        number: '1',
        rarity: 'Common',
        imageUrl: '',
        marketPriceUsd: 1,
        marketPriceSgd: 1.35,
        isArtCollection: false,
        artValue: null,
        dateAdded: '2026-01-01',
      })
      const id = store.cards[0].id
      store.updateCard(id, { name: 'Raichu' })
      const stored = JSON.parse(localStorage.getItem('meowth_cards') ?? '[]')
      expect(stored[0].name).toBe('Raichu')
    })
  })

  describe('removeCard', () => {
    it('removes card by id', () => {
      const store = useCollectionStore()
      store.addCard({
        pokemonTcgId: 'xy1-1',
        name: 'Pikachu',
        setName: 'XY',
        setId: 'xy1',
        number: '1',
        rarity: 'Common',
        imageUrl: '',
        marketPriceUsd: 1,
        marketPriceSgd: 1.35,
        isArtCollection: false,
        artValue: null,
        dateAdded: '2026-01-01',
      })
      const id = store.cards[0].id
      store.removeCard(id)
      expect(store.cards).toHaveLength(0)
    })

    it('persists removal to localStorage', () => {
      const store = useCollectionStore()
      store.addCard({
        pokemonTcgId: 'xy1-1',
        name: 'Pikachu',
        setName: 'XY',
        setId: 'xy1',
        number: '1',
        rarity: 'Common',
        imageUrl: '',
        marketPriceUsd: 1,
        marketPriceSgd: 1.35,
        isArtCollection: false,
        artValue: null,
        dateAdded: '2026-01-01',
      })
      const id = store.cards[0].id
      store.removeCard(id)
      const stored = JSON.parse(localStorage.getItem('meowth_cards') ?? '[]')
      expect(stored).toHaveLength(0)
    })
  })

  describe('totalValue', () => {
    it('sums marketPriceSgd for regular cards', () => {
      const store = useCollectionStore()
      store.addCard(makeCard({ id: '', name: 'A', setName: 'XY', marketPriceSgd: 10, artValue: null, isArtCollection: false }))
      store.addCard(makeCard({ id: '', name: 'B', setName: 'XY', marketPriceSgd: 5, artValue: null, isArtCollection: false }))
      expect(store.totalValue).toBeCloseTo(15)
    })

    it('uses artValue (not marketPriceSgd) for art collection cards', () => {
      const store = useCollectionStore()
      store.addCard(makeCard({ id: '', name: 'Art1', setName: 'Special', marketPriceSgd: 100, isArtCollection: true, artValue: 200 }))
      store.addCard(makeCard({ id: '', name: 'Regular', setName: 'XY', marketPriceSgd: 10, isArtCollection: false, artValue: null }))
      expect(store.totalValue).toBeCloseTo(210)
    })

    it('returns 0 when no cards', () => {
      const store = useCollectionStore()
      expect(store.totalValue).toBe(0)
    })
  })

  describe('artCollectionValue', () => {
    it('sums artValue of art collection cards only', () => {
      const store = useCollectionStore()
      store.addCard(makeCard({ id: '', name: 'Art1', setName: 'Special', marketPriceSgd: 100, isArtCollection: true, artValue: 150 }))
      store.addCard(makeCard({ id: '', name: 'Art2', setName: 'Special', marketPriceSgd: 50, isArtCollection: true, artValue: 300 }))
      store.addCard(makeCard({ id: '', name: 'Regular', setName: 'XY', marketPriceSgd: 10, isArtCollection: false, artValue: null }))
      expect(store.artCollectionValue).toBeCloseTo(450)
    })

    it('returns 0 when no art collection cards', () => {
      const store = useCollectionStore()
      store.addCard(makeCard({ id: '', name: 'Regular', setName: 'XY', marketPriceSgd: 10, isArtCollection: false, artValue: null }))
      expect(store.artCollectionValue).toBe(0)
    })
  })

  describe('cardsBySet', () => {
    it('groups regular cards by setName', () => {
      const store = useCollectionStore()
      store.addCard(makeCard({ id: '', name: 'A', setName: 'XY', marketPriceSgd: 1 }))
      store.addCard(makeCard({ id: '', name: 'B', setName: 'XY', marketPriceSgd: 2 }))
      store.addCard(makeCard({ id: '', name: 'C', setName: 'SV', marketPriceSgd: 3 }))
      const bySet = store.cardsBySet
      expect(bySet.get('XY')).toHaveLength(2)
      expect(bySet.get('SV')).toHaveLength(1)
    })

    it('excludes art collection cards', () => {
      const store = useCollectionStore()
      store.addCard(makeCard({ id: '', name: 'Regular', setName: 'XY', isArtCollection: false }))
      store.addCard(makeCard({ id: '', name: 'Art', setName: 'Special', isArtCollection: true, artValue: 200 }))
      const bySet = store.cardsBySet
      expect(bySet.has('Special')).toBe(false)
      expect(bySet.get('XY')).toHaveLength(1)
    })

    it('returns empty Map when no regular cards', () => {
      const store = useCollectionStore()
      store.addCard(makeCard({ id: '', name: 'Art', setName: 'Special', isArtCollection: true, artValue: 100 }))
      expect(store.cardsBySet.size).toBe(0)
    })
  })

  describe('artCollectionCards', () => {
    it('returns only art collection cards', () => {
      const store = useCollectionStore()
      store.addCard(makeCard({ id: '', name: 'Regular', setName: 'XY', isArtCollection: false }))
      store.addCard(makeCard({ id: '', name: 'Art1', setName: 'Special', isArtCollection: true, artValue: 100 }))
      store.addCard(makeCard({ id: '', name: 'Art2', setName: 'Special', isArtCollection: true, artValue: 200 }))
      expect(store.artCollectionCards).toHaveLength(2)
      expect(store.artCollectionCards.every(c => c.isArtCollection)).toBe(true)
    })

    it('returns empty array when no art collection cards', () => {
      const store = useCollectionStore()
      store.addCard(makeCard({ id: '', name: 'Regular', setName: 'XY', isArtCollection: false }))
      expect(store.artCollectionCards).toHaveLength(0)
    })
  })

  describe('topCards', () => {
    it('returns top 5 cards by value descending', () => {
      const store = useCollectionStore()
      // Add 7 regular cards with different prices
      for (let i = 1; i <= 7; i++) {
        store.addCard(makeCard({ id: '', name: `Card${i}`, setName: 'XY', marketPriceSgd: i * 10, isArtCollection: false, artValue: null }))
      }
      const top = store.topCards
      expect(top).toHaveLength(5)
      expect(top[0].marketPriceSgd).toBe(70)
      expect(top[4].marketPriceSgd).toBe(30)
    })

    it('uses artValue for art collection cards in ordering', () => {
      const store = useCollectionStore()
      store.addCard(makeCard({ id: '', name: 'Art', setName: 'Special', marketPriceSgd: 1, isArtCollection: true, artValue: 999 }))
      store.addCard(makeCard({ id: '', name: 'Regular', setName: 'XY', marketPriceSgd: 50, isArtCollection: false, artValue: null }))
      const top = store.topCards
      expect(top[0].name).toBe('Art')
    })

    it('returns all cards when fewer than 5', () => {
      const store = useCollectionStore()
      store.addCard(makeCard({ id: '', name: 'A', setName: 'XY', marketPriceSgd: 10 }))
      store.addCard(makeCard({ id: '', name: 'B', setName: 'XY', marketPriceSgd: 20 }))
      expect(store.topCards).toHaveLength(2)
    })
  })

  describe('valueBySet', () => {
    it('returns set value totals sorted descending', () => {
      const store = useCollectionStore()
      store.addCard(makeCard({ id: '', name: 'A', setName: 'XY', marketPriceSgd: 5, isArtCollection: false }))
      store.addCard(makeCard({ id: '', name: 'B', setName: 'XY', marketPriceSgd: 10, isArtCollection: false }))
      store.addCard(makeCard({ id: '', name: 'C', setName: 'SV', marketPriceSgd: 20, isArtCollection: false }))
      const result = store.valueBySet
      expect(result[0].setName).toBe('SV')
      expect(result[0].value).toBe(20)
      expect(result[1].setName).toBe('XY')
      expect(result[1].value).toBe(15)
    })

    it('includes art collection as a separate entry', () => {
      const store = useCollectionStore()
      store.addCard(makeCard({ id: '', name: 'Regular', setName: 'XY', marketPriceSgd: 10, isArtCollection: false }))
      store.addCard(makeCard({ id: '', name: 'Art', setName: 'Special', marketPriceSgd: 1, isArtCollection: true, artValue: 100 }))
      const result = store.valueBySet
      const artEntry = result.find(e => e.setName === 'Art Collection')
      expect(artEntry).toBeDefined()
      expect(artEntry?.value).toBe(100)
    })

    it('returns empty array when no cards', () => {
      const store = useCollectionStore()
      expect(store.valueBySet).toHaveLength(0)
    })

    it('art collection entry uses artValue not marketPriceSgd', () => {
      const store = useCollectionStore()
      store.addCard(makeCard({ id: '', name: 'Art1', setName: 'Promo', marketPriceSgd: 500, isArtCollection: true, artValue: 250 }))
      const result = store.valueBySet
      const artEntry = result.find(e => e.setName === 'Art Collection')
      expect(artEntry?.value).toBe(250)
    })
  })
})
