import type { Expense } from '@/types/expense'
import type { Card } from '@/types/card'

const KEYS = {
  expenses: 'meowth_expenses',
  cards: 'meowth_cards',
  exchangeRate: 'meowth_exchange_rate',
} as const

export interface ExchangeRateCache {
  rate: number
  timestamp: number
}

export interface DataStore {
  getExpenses(): Expense[]
  saveExpenses(expenses: Expense[]): void
  getCards(): Card[]
  saveCards(cards: Card[]): void
  getExchangeRate(): ExchangeRateCache | null
  saveExchangeRate(data: ExchangeRateCache): void
}

function getJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function setJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export const storage: DataStore = {
  getExpenses: () => getJson<Expense[]>(KEYS.expenses, []),
  saveExpenses: (expenses) => setJson(KEYS.expenses, expenses),
  getCards: () => getJson<Card[]>(KEYS.cards, []),
  saveCards: (cards) => setJson(KEYS.cards, cards),
  getExchangeRate: () => getJson<ExchangeRateCache | null>(KEYS.exchangeRate, null),
  saveExchangeRate: (data) => setJson(KEYS.exchangeRate, data),
}
