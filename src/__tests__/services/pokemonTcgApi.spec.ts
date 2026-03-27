import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockCardList, mockCardGet, mockSetList } = vi.hoisted(() => ({
  mockCardList: vi.fn(),
  mockCardGet: vi.fn(),
  mockSetList: vi.fn(),
}))

vi.mock('@tcgdex/sdk', () => {
  class MockTCGdex {
    card = { list: mockCardList, get: mockCardGet }
    set = { list: mockSetList }
  }
  const Query = {
    create: () => ({
      equal: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      paginate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
    }),
  }
  return { default: MockTCGdex, Query }
})

import { searchCards, getCard, getSets } from '@/services/pokemonTcgApi'

describe('pokemonTcgApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('searchCards', () => {
    it('returns mapped card briefs from TCGdex', async () => {
      mockCardList.mockResolvedValueOnce([
        { id: 'swsh3-136', localId: '136', name: 'Furret', image: 'https://assets.tcgdex.net/en/swsh/swsh3/136' },
      ])

      const result = await searchCards('Furret')

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: 'swsh3-136',
        name: 'Furret',
        localId: '136',
        image: 'https://assets.tcgdex.net/en/swsh/swsh3/136',
      })
    })

    it('returns empty array when no results', async () => {
      mockCardList.mockResolvedValueOnce(null)

      const result = await searchCards('NonexistentCard')

      expect(result).toEqual([])
    })

    it('returns empty array on error', async () => {
      mockCardList.mockRejectedValueOnce(new Error('Network error'))

      const result = await searchCards('Pikachu')

      expect(result).toEqual([])
    })
  })

  describe('getCard', () => {
    it('returns full card with pricing from TCGdex', async () => {
      mockCardGet.mockResolvedValueOnce({
        id: 'swsh3-136',
        name: 'Furret',
        localId: '136',
        rarity: 'Uncommon',
        set: { id: 'swsh3', name: 'Darkness Ablaze' },
        image: 'https://assets.tcgdex.net/en/swsh/swsh3/136',
        pricing: {
          tcgplayer: {
            updated: '2026-03-26T20:04:46.000Z',
            unit: 'USD',
            normal: { marketPrice: 0.16 },
          },
        },
      })

      const result = await getCard('swsh3-136')

      expect(result.id).toBe('swsh3-136')
      expect(result.name).toBe('Furret')
      expect(result.set.name).toBe('Darkness Ablaze')
      expect(result.pricing?.tcgplayer?.normal?.marketPrice).toBe(0.16)
    })

    it('throws when card not found', async () => {
      mockCardGet.mockResolvedValueOnce(null)

      await expect(getCard('nonexistent')).rejects.toThrow('Card not found: nonexistent')
    })
  })

  describe('getSets', () => {
    it('returns list of sets', async () => {
      mockSetList.mockResolvedValueOnce([
        { id: 'sv1', name: 'Scarlet & Violet', cardCount: { total: 198, official: 198 } },
        { id: 'swsh3', name: 'Darkness Ablaze', cardCount: { total: 201, official: 189 } },
      ])

      const result = await getSets()

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ id: 'sv1', name: 'Scarlet & Violet', releaseDate: '' })
    })

    it('returns empty array on error', async () => {
      mockSetList.mockRejectedValueOnce(new Error('Network error'))

      const result = await getSets()

      expect(result).toEqual([])
    })
  })
})
