import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the storage service before importing currencyService
vi.mock('@/services/storage', () => ({
  storage: {
    getExchangeRate: vi.fn(),
    saveExchangeRate: vi.fn(),
  },
}))

import { convertUsdToSgd, fetchAndCacheRate, getRate, formatSgd } from '@/services/currencyService'
import { storage } from '@/services/storage'

const FALLBACK_RATE = 1.35

describe('currencyService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('convertUsdToSgd', () => {
    it('multiplies by cached rate', () => {
      const cachedRate = 1.42
      vi.mocked(storage.getExchangeRate).mockReturnValue({
        rate: cachedRate,
        timestamp: Date.now(),
      })

      const result = convertUsdToSgd(10)
      expect(result).toBeCloseTo(10 * cachedRate)
    })

    it('returns USD * fallback rate when no cache', () => {
      vi.mocked(storage.getExchangeRate).mockReturnValue(null)

      const result = convertUsdToSgd(10)
      expect(result).toBeCloseTo(10 * FALLBACK_RATE)
    })
  })

  describe('fetchAndCacheRate', () => {
    it('stores rate in storage', async () => {
      const mockRate = 1.38
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ rates: { SGD: mockRate } }),
      } as unknown as Response)

      await fetchAndCacheRate()

      expect(storage.saveExchangeRate).toHaveBeenCalledWith(
        expect.objectContaining({ rate: mockRate }),
      )
    })
  })

  describe('getRate', () => {
    it('returns cached rate when fresh (< 24h)', () => {
      const freshTimestamp = Date.now() - 1000 * 60 * 60 // 1 hour ago
      const cachedRate = 1.40
      vi.mocked(storage.getExchangeRate).mockReturnValue({
        rate: cachedRate,
        timestamp: freshTimestamp,
      })

      const result = getRate()
      expect(result).toBe(cachedRate)
    })

    it('returns fallback rate when cache is expired (> 24h)', () => {
      const expiredTimestamp = Date.now() - 1000 * 60 * 60 * 25 // 25 hours ago
      vi.mocked(storage.getExchangeRate).mockReturnValue({
        rate: 1.40,
        timestamp: expiredTimestamp,
      })

      const result = getRate()
      expect(result).toBe(FALLBACK_RATE)
    })

    it('returns fallback rate when no cache exists', () => {
      vi.mocked(storage.getExchangeRate).mockReturnValue(null)

      const result = getRate()
      expect(result).toBe(FALLBACK_RATE)
    })
  })

  describe('formatSgd', () => {
    it('formats numbers as SGD strings', () => {
      expect(formatSgd(1234.56)).toBe('$1,234.56')
    })

    it('formats small amounts correctly', () => {
      expect(formatSgd(5)).toBe('$5.00')
    })

    it('formats zero correctly', () => {
      expect(formatSgd(0)).toBe('$0.00')
    })

    it('formats large numbers with commas', () => {
      expect(formatSgd(12345.67)).toBe('$12,345.67')
    })
  })
})
