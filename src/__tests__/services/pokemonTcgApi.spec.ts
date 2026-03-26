import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { searchCards, getSets } from '@/services/pokemonTcgApi'

describe('pokemonTcgApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('searchCards', () => {
    it('calls correct API URL with query parameter', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      } as Response)

      await searchCards('Pikachu')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.pokemontcg.io/v2/cards?q=name:"Pikachu"&pageSize=20&select=id,name,set,number,rarity,images,tcgplayer',
      )
    })

    it('maps API response to PokemonTcgCard format', async () => {
      const mockFetch = vi.mocked(fetch)
      const mockCard = {
        id: 'xy1-1',
        name: 'Venusaur-EX',
        number: '1',
        rarity: 'Rare Holo EX',
        set: { id: 'xy1', name: 'XY' },
        images: { small: 'https://images.pokemontcg.io/xy1/1.png', large: 'https://images.pokemontcg.io/xy1/1_hires.png' },
        tcgplayer: { prices: { holofoil: { market: 5.99 } } },
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockCard] }),
      } as Response)

      const result = await searchCards('Venusaur')

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(mockCard)
    })

    it('returns empty array on network error', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await searchCards('Pikachu')

      expect(result).toEqual([])
    })
  })

  describe('getSets', () => {
    it('returns list of set objects', async () => {
      const mockFetch = vi.mocked(fetch)
      const mockSets = [
        { id: 'sv1', name: 'Scarlet & Violet', releaseDate: '2023-03-31' },
        { id: 'xy1', name: 'XY', releaseDate: '2014-02-05' },
      ]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockSets }),
      } as Response)

      const result = await getSets()

      expect(result).toEqual(mockSets)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.pokemontcg.io/v2/sets?select=id,name,releaseDate&orderBy=-releaseDate',
      )
    })
  })
})
