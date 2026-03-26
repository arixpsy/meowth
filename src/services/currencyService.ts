import { storage } from '@/services/storage'

const FALLBACK_RATE = 1.35
const EXCHANGE_RATE_API = 'https://open.er-api.com/v6/latest/USD'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

interface ExchangeRateApiResponse {
  rates: {
    SGD: number
  }
}

/**
 * Returns the current USD→SGD rate.
 * Uses the cached rate if it is fresh (< 24h old), otherwise returns the fallback.
 */
export function getRate(): number {
  const cached = storage.getExchangeRate()
  if (!cached) return FALLBACK_RATE

  const age = Date.now() - cached.timestamp
  if (age >= CACHE_TTL_MS) return FALLBACK_RATE

  return cached.rate
}

/**
 * Fetches the latest USD→SGD rate from the exchange-rate API and persists it
 * in localStorage via the storage service.
 */
export async function fetchAndCacheRate(): Promise<void> {
  const response = await fetch(EXCHANGE_RATE_API)
  const data = (await response.json()) as ExchangeRateApiResponse
  const rate = data.rates.SGD
  storage.saveExchangeRate({ rate, timestamp: Date.now() })
}

/**
 * Called at app startup. Fetches a fresh rate if the cached value is
 * missing or older than 24 hours.
 */
export async function initRate(): Promise<void> {
  const cached = storage.getExchangeRate()
  if (!cached || Date.now() - cached.timestamp >= CACHE_TTL_MS) {
    await fetchAndCacheRate()
  }
}

/**
 * Converts a USD amount to SGD using the current rate.
 */
export function convertUsdToSgd(usd: number): number {
  return usd * getRate()
}

/**
 * Formats a number as an SGD string, e.g. `$1,234.56`.
 */
export function formatSgd(amount: number): string {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
