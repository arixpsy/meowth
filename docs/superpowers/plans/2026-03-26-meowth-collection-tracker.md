# Meowth Collection Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Pokemon card expense and collection tracker with dashboard, expenses, collection, and analytics pages — all in SGD with USD→SGD conversion for card market prices.

**Architecture:** Vue 3 SPA with sidebar navigation and 4 route pages. Pinia stores for expenses and collection, backed by a localStorage abstraction layer. Pokemon TCG API for card search/pricing, free exchange rate API for USD→SGD. Chart.js for analytics visualizations.

**Tech Stack:** Vue 3, TypeScript, Vite, Pinia, Vue Router, Chart.js + vue-chartjs, Pokemon TCG API, Exchange Rate API

**Spec:** `docs/superpowers/specs/2026-03-26-meowth-collection-tracker-design.md`

**Design Mockups:** `.superpowers/brainstorm/25171-1774460944/` (dashboard-v2.html, expenses-page.html, collection-page.html, analytics-page.html)

---

## File Structure

```
src/
├── types/
│   ├── expense.ts              # Expense type + ExpenseCategory enum
│   └── card.ts                 # Card type
├── services/
│   ├── storage.ts              # DataStore interface + localStorage implementation
│   ├── pokemonTcgApi.ts        # Pokemon TCG API client
│   └── currencyService.ts      # USD→SGD exchange rate fetch + cache
├── stores/
│   ├── expenseStore.ts         # Expense CRUD + derived getters
│   ├── collectionStore.ts      # Card collection CRUD + derived getters
│   └── analyticsStore.ts       # Cross-store derived analytics
├── composables/
│   └── useCurrency.ts          # Composable for formatting SGD values
├── components/
│   ├── layout/
│   │   ├── AppSidebar.vue      # Sidebar navigation (desktop + mobile)
│   │   └── MobileNav.vue       # Bottom tab bar for mobile
│   ├── shared/
│   │   ├── SlidePanel.vue      # Reusable right slide-out panel
│   │   └── FilterChips.vue     # Reusable filter chip bar
│   ├── dashboard/
│   │   ├── HeroCard.vue        # Profit/loss hero section
│   │   ├── CategoryCards.vue   # Top spending categories
│   │   ├── RecentActivity.vue  # Recent expenses + card adds
│   │   └── TopCards.vue        # Most valuable cards
│   ├── expenses/
│   │   ├── ExpenseTable.vue    # Filterable expense list
│   │   └── ExpenseForm.vue     # Add/edit expense slide-out form
│   ├── collection/
│   │   ├── CollectionStats.vue # Stats bar (total cards, value, etc.)
│   │   ├── SetGroup.vue        # Cards grouped under a set header
│   │   ├── CardTile.vue        # Single card in the grid
│   │   └── AddCardPanel.vue    # API search + add card slide-out
│   └── analytics/
│       ├── SpendingValueChart.vue  # Cumulative line chart
│       ├── CategoryDonut.vue       # Spending by category donut
│       ├── ValueBySet.vue          # Horizontal bar chart
│       ├── MonthlySpending.vue     # Grouped bar chart
│       └── InsightsPanel.vue       # Computed stat rows
├── pages/
│   ├── DashboardPage.vue
│   ├── ExpensesPage.vue
│   ├── CollectionPage.vue
│   └── AnalyticsPage.vue
├── assets/
│   └── main.css                # Global styles, CSS custom properties, fonts
├── router/
│   └── index.ts
├── App.vue
└── main.ts
```

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`
- Modify: `index.html` (title + fonts)

- [ ] **Step 1: Install chart.js and vue-chartjs**

Run: `cd /Users/arixphua/Documents/GitHub/meowth && pnpm add chart.js vue-chartjs`

- [ ] **Step 2: Install uuid for generating IDs**

Run: `pnpm add uuid && pnpm add -D @types/uuid`

- [ ] **Step 3: Update index.html with app title and Google Fonts**

Update `index.html`:
- Title: "Meowth — Collection Tracker"
- Add Google Fonts preconnect + stylesheet for Instrument Serif, DM Sans, JetBrains Mono

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meowth — Collection Tracker</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 4: Verify dev server starts**

Run: `pnpm dev` — confirm no errors, then stop.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml index.html
git commit -m "chore: install chart.js, vue-chartjs, uuid and configure fonts"
```

---

## Task 2: Types & Design Tokens

**Files:**
- Create: `src/types/expense.ts`
- Create: `src/types/card.ts`
- Create: `src/assets/main.css`
- Modify: `src/main.ts` (import CSS)
- Delete sample: `src/stores/counter.ts`
- Delete sample: `src/__tests__/App.spec.ts`

- [ ] **Step 1: Create expense types**

```typescript
// src/types/expense.ts
export const EXPENSE_CATEGORIES = ['sealed', 'singles', 'supplies', 'art-supplies', 'others'] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export interface Expense {
  id: string
  itemName: string
  category: ExpenseCategory
  amount: number // SGD
  date: string // ISO date string YYYY-MM-DD
  notes: string
}

export const CATEGORY_CONFIG: Record<ExpenseCategory, { label: string; color: string }> = {
  sealed: { label: 'Sealed Product', color: '#c44033' },
  singles: { label: 'Singles', color: '#2d5a27' },
  supplies: { label: 'Supplies', color: '#5b7bd5' },
  'art-supplies': { label: 'Art Supplies', color: '#b8860b' },
  others: { label: 'Others', color: '#9a9a9a' },
}
```

- [ ] **Step 2: Create card types**

```typescript
// src/types/card.ts
export interface Card {
  id: string
  pokemonTcgId: string
  name: string
  setName: string
  setId: string
  number: string
  rarity: string
  imageUrl: string
  marketPriceUsd: number
  marketPriceSgd: number
  isArtCollection: boolean
  artValue: number | null // SGD, only when isArtCollection is true
  dateAdded: string // ISO date string YYYY-MM-DD
}
```

- [ ] **Step 3: Create global CSS with design tokens**

Create `src/assets/main.css` with CSS custom properties from the spec's Design Language section. Include:
- `:root` variables for all colors, radii, typography
- Base reset (`* { margin:0; padding:0; box-sizing:border-box }`)
- Body styles: `font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text-primary);`
- Typography utility classes for `.heading-serif`, `.mono`
- Scrollbar styling for the light theme

Key CSS variables:
```css
:root {
  --bg: #f6f5f1;
  --bg-card: #ffffff;
  --bg-elevated: #fafaf8;
  --text-primary: #1a1a1a;
  --text-secondary: #6b6b6b;
  --text-muted: #9a9a9a;
  --border: #e8e6e1;
  --border-light: #f0eeea;
  --accent: #2d5a27;
  --accent-light: #e8f0e6;
  --negative: #c44033;
  --negative-light: #fceae8;
  --gold: #b8860b;
  --gold-light: #faf3e0;
  --blue: #5b7bd5;
  --blue-light: #eef1fa;
  --radius: 16px;
  --radius-sm: 10px;
}
```

- [ ] **Step 4: Import CSS in main.ts**

Add `import './assets/main.css'` to `src/main.ts`.

- [ ] **Step 5: Delete sample files**

Delete `src/stores/counter.ts` and `src/__tests__/App.spec.ts` — these are template scaffolding we no longer need.

- [ ] **Step 6: Verify type-check passes**

Run: `pnpm type-check`
Expected: Clean pass (types are standalone, no imports of missing modules).

- [ ] **Step 7: Commit**

```bash
git add src/types/ src/assets/main.css src/main.ts
git rm src/stores/counter.ts src/__tests__/App.spec.ts
git commit -m "feat: add type definitions, design tokens, and global CSS"
```

---

## Task 3: Storage Service

**Files:**
- Create: `src/services/storage.ts`
- Create: `src/__tests__/services/storage.spec.ts`

- [ ] **Step 1: Write failing tests for storage service**

Test cases:
- `getExpenses` returns empty array when nothing stored
- `saveExpenses` then `getExpenses` round-trips data
- `getCards` returns empty array when nothing stored
- `saveCards` then `getCards` round-trips data
- `getExchangeRate` returns null when nothing cached
- `saveExchangeRate` then `getExchangeRate` round-trips rate + timestamp

```typescript
// src/__tests__/services/storage.spec.ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test:unit --run src/__tests__/services/storage.spec.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement storage service**

```typescript
// src/services/storage.ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:unit --run src/__tests__/services/storage.spec.ts`
Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/storage.ts src/__tests__/services/storage.spec.ts
git commit -m "feat: add localStorage storage service with DataStore interface"
```

---

## Task 4: Currency Service

**Files:**
- Create: `src/services/currencyService.ts`
- Create: `src/composables/useCurrency.ts`
- Create: `src/__tests__/services/currencyService.spec.ts`

- [ ] **Step 1: Write failing tests**

Test cases:
- `convertUsdToSgd` multiplies by cached rate
- `convertUsdToSgd` returns USD * fallback rate when no cache
- `fetchAndCacheRate` stores rate in storage
- `getRate` returns cached rate when fresh (< 24h)
- `formatSgd` formats numbers as SGD strings

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test:unit --run src/__tests__/services/currencyService.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Implement currency service**

The service:
- Fetches USD→SGD rate from `https://open.er-api.com/v6/latest/USD` (free, no key needed)
- Caches rate + timestamp in localStorage via storage service
- Provides `convertUsdToSgd(usd: number): number`
- Provides `getRate(): number` — returns cached rate, or fallback `1.35` if expired/missing
- Provides `initRate(): Promise<void>` — called on app startup, fetches if cache > 24h old
- Provides `formatSgd(amount: number): string` — formats as `$1,234.56`

- [ ] **Step 4: Implement useCurrency composable**

```typescript
// src/composables/useCurrency.ts
import { formatSgd } from '@/services/currencyService'

export function useCurrency() {
  return { formatSgd }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm test:unit --run src/__tests__/services/currencyService.spec.ts`
Expected: All PASS.

- [ ] **Step 6: Commit**

```bash
git add src/services/currencyService.ts src/composables/useCurrency.ts src/__tests__/services/currencyService.spec.ts
git commit -m "feat: add currency service with USD→SGD conversion and caching"
```

---

## Task 5: Pokemon TCG API Service

**Files:**
- Create: `src/services/pokemonTcgApi.ts`
- Create: `src/__tests__/services/pokemonTcgApi.spec.ts`

- [ ] **Step 1: Write failing tests**

Test cases (using mocked fetch):
- `searchCards` calls correct API URL with query parameter
- `searchCards` maps API response to Card-compatible format
- `searchCards` returns empty array on network error
- `getSets` returns list of set objects

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test:unit --run src/__tests__/services/pokemonTcgApi.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Implement Pokemon TCG API service**

The service:
- Base URL: `https://api.pokemontcg.io/v2`
- `searchCards(query: string): Promise<PokemonTcgCard[]>` — `GET /cards?q=name:"${query}"&pageSize=20&select=id,name,set,number,rarity,images,tcgplayer`
- `getCard(id: string): Promise<PokemonTcgCard>` — `GET /cards/${id}`
- `getSets(): Promise<PokemonTcgSet[]>` — `GET /sets?select=id,name,releaseDate&orderBy=-releaseDate`
- Return types are API-specific (`PokemonTcgCard`, `PokemonTcgSet`) — the stores handle mapping to our `Card` type
- Handles errors gracefully (returns empty arrays / throws readable errors)

Define API response types:
```typescript
export interface PokemonTcgCard {
  id: string
  name: string
  number: string
  rarity?: string
  set: { id: string; name: string }
  images: { small: string; large: string }
  tcgplayer?: { prices?: Record<string, { market?: number }> }
}

export interface PokemonTcgSet {
  id: string
  name: string
  releaseDate: string
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:unit --run src/__tests__/services/pokemonTcgApi.spec.ts`
Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/pokemonTcgApi.ts src/__tests__/services/pokemonTcgApi.spec.ts
git commit -m "feat: add Pokemon TCG API service for card search and set listing"
```

---

## Task 6: Expense Store

**Files:**
- Create: `src/stores/expenseStore.ts`
- Create: `src/__tests__/stores/expenseStore.spec.ts`

- [ ] **Step 1: Write failing tests**

Test cases:
- `addExpense` adds to list and persists to storage
- `updateExpense` modifies existing expense by id
- `deleteExpense` removes by id
- `totalSpent` sums all expense amounts
- `spentByCategory` returns { category: totalAmount } map
- `recentExpenses` returns last 5 sorted by date descending
- `monthlySpending` returns array of { month, amounts by category }
- Store loads initial data from storage on creation

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test:unit --run src/__tests__/stores/expenseStore.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Implement expense store**

Pinia composition store using `setup` syntax (matching existing codebase pattern). State: `expenses` ref loaded from `storage.getExpenses()`. All mutations call `storage.saveExpenses()` after modifying state. Getters are computed properties.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:unit --run src/__tests__/stores/expenseStore.spec.ts`
Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/stores/expenseStore.ts src/__tests__/stores/expenseStore.spec.ts
git commit -m "feat: add expense store with CRUD, category breakdowns, and persistence"
```

---

## Task 7: Collection Store

**Files:**
- Create: `src/stores/collectionStore.ts`
- Create: `src/__tests__/stores/collectionStore.spec.ts`

- [ ] **Step 1: Write failing tests**

Test cases:
- `addCard` adds to list and persists
- `updateCard` modifies existing card
- `removeCard` removes by id
- `totalValue` sums marketPriceSgd + artValue for art cards
- `artCollectionValue` sums only art collection artValues
- `cardsBySet` groups cards by setName (excluding art collection)
- `artCollectionCards` filters only isArtCollection cards
- `topCards` returns top 5 by value descending
- `valueBySet` returns { setName: totalValue } sorted descending
- Art collection cards use artValue (not marketPriceSgd) for value calculations

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test:unit --run src/__tests__/stores/collectionStore.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Implement collection store**

Same Pinia composition pattern. Cards loaded from `storage.getCards()`. The `totalValue` getter sums: for art cards use `artValue`, for regular cards use `marketPriceSgd`. The `cardsBySet` getter returns `Map<string, Card[]>` excluding art cards. The `valueBySet` includes art collection as a separate entry.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:unit --run src/__tests__/stores/collectionStore.spec.ts`
Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/stores/collectionStore.ts src/__tests__/stores/collectionStore.spec.ts
git commit -m "feat: add collection store with set grouping, art collection, and value calculations"
```

---

## Task 8: Analytics Store

**Files:**
- Create: `src/stores/analyticsStore.ts`
- Create: `src/__tests__/stores/analyticsStore.spec.ts`

- [ ] **Step 1: Write failing tests**

Test cases:
- `profitLoss` = collection totalValue - expense totalSpent
- `roi` = (profitLoss / totalSpent) * 100, or 0 if no spending
- `spendingOverTime` returns cumulative monthly spending array
- `valueOverTime` returns monthly collection value snapshots
- `insights` returns: mostValuableCard, biggestExpense, avgMonthlySpend, roi, topCategory

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test:unit --run src/__tests__/stores/analyticsStore.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Implement analytics store**

Pinia composition store that imports and uses `useExpenseStore()` and `useCollectionStore()`. All getters are computed properties derived from the other two stores.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:unit --run src/__tests__/stores/analyticsStore.spec.ts`
Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/stores/analyticsStore.ts src/__tests__/stores/analyticsStore.spec.ts
git commit -m "feat: add analytics store with P/L, ROI, and trend calculations"
```

---

## Task 9: App Layout & Router

**Files:**
- Create: `src/components/layout/AppSidebar.vue`
- Create: `src/components/layout/MobileNav.vue`
- Create: `src/pages/DashboardPage.vue` (placeholder)
- Create: `src/pages/ExpensesPage.vue` (placeholder)
- Create: `src/pages/CollectionPage.vue` (placeholder)
- Create: `src/pages/AnalyticsPage.vue` (placeholder)
- Modify: `src/router/index.ts`
- Modify: `src/App.vue`
- Modify: `src/main.ts` (init currency service)

- [ ] **Step 1: Create placeholder page components**

Each page is a minimal `<template>` with an `<h1>` page title (e.g., "Dashboard", "Expenses"). These will be fleshed out in later tasks.

- [ ] **Step 2: Set up router with 4 routes**

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: () => import('@/pages/DashboardPage.vue') },
    { path: '/expenses', name: 'expenses', component: () => import('@/pages/ExpensesPage.vue') },
    { path: '/collection', name: 'collection', component: () => import('@/pages/CollectionPage.vue') },
    { path: '/analytics', name: 'analytics', component: () => import('@/pages/AnalyticsPage.vue') },
  ],
})

export default router
```

- [ ] **Step 3: Build AppSidebar component**

Match the mockup design: fixed left sidebar (240px), logo "Meowth" in Instrument Serif, "Collection Tracker" subtitle, 4 nav items with SVG icons. Active state: black background + white text. Uses `<RouterLink>` for navigation. Hidden on mobile (`display:none` below 768px).

- [ ] **Step 4: Build MobileNav component**

Bottom tab bar for mobile only (`display:none` above 768px). 4 icons with labels matching the sidebar. Fixed to bottom, white background, border-top.

- [ ] **Step 5: Wire up App.vue**

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue'
import MobileNav from '@/components/layout/MobileNav.vue'
</script>

<template>
  <div class="app-layout">
    <AppSidebar />
    <main class="main-content">
      <RouterView />
    </main>
    <MobileNav />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}
.main-content {
  margin-left: 240px;
  flex: 1;
  padding: 40px 48px;
  max-width: 1100px;
}
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 24px 16px 80px;
  }
}
</style>
```

- [ ] **Step 6: Init currency service on app startup**

In `src/main.ts`, call `initRate()` from currencyService after mounting the app (fire-and-forget — the app works with fallback rate if the fetch is slow).

- [ ] **Step 7: Verify app loads with sidebar navigation and routing works**

Run: `pnpm dev` — navigate between all 4 routes, verify sidebar active state updates, verify mobile nav visible at narrow viewport. Then stop.

- [ ] **Step 8: Commit**

```bash
git add src/components/layout/ src/pages/ src/router/index.ts src/App.vue src/main.ts
git commit -m "feat: add app layout with sidebar, mobile nav, router, and 4 page shells"
```

---

## Task 10: Shared Components (SlidePanel + FilterChips)

**Files:**
- Create: `src/components/shared/SlidePanel.vue`
- Create: `src/components/shared/FilterChips.vue`

- [ ] **Step 1: Build SlidePanel component**

Props: `open: boolean`, `title: string`. Emits: `close`. Renders a fixed right panel (420px desktop, 100% mobile) with backdrop overlay. Slides in/out with CSS transition. Contains a title, close button, and `<slot>` for content.

- [ ] **Step 2: Build FilterChips component**

Props: `options: { key: string; label: string }[]`, `modelValue: string`. Emits: `update:modelValue`. Renders horizontal chip bar. Active chip gets dark styling. Horizontally scrollable on mobile with `-webkit-overflow-scrolling: touch`.

- [ ] **Step 3: Verify components render in isolation**

Temporarily mount in a placeholder page, check styling and interactions work. Then remove the temporary usage.

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/
git commit -m "feat: add SlidePanel and FilterChips shared components"
```

---

## Task 11: Expenses Page

**Files:**
- Create: `src/components/expenses/ExpenseTable.vue`
- Create: `src/components/expenses/ExpenseForm.vue`
- Modify: `src/pages/ExpensesPage.vue`

- [ ] **Step 1: Build ExpenseForm component**

Slide-out form using SlidePanel. Fields: Item Name (text), Category (tappable tile grid with icons — Sealed 📦, Singles 🃏, Supplies 🛡️, Art 🎨, Others 📋), Amount (number input with $ prefix), Date (date input, defaults to today), Notes (text input). Emits `save` with the Expense data. For editing: accepts optional `expense` prop to pre-fill fields.

- [ ] **Step 2: Build ExpenseTable component**

Props: `expenses: Expense[]`. Displays the table from the mockup: Date, Item Name, Category (dot + label), Amount (red), Actions (··· button). Each row has edit/delete on the actions menu. On mobile: hide Category and Actions columns. Uses `useCurrency` for formatting amounts.

- [ ] **Step 3: Wire up ExpensesPage**

```vue
<!-- src/pages/ExpensesPage.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useExpenseStore } from '@/stores/expenseStore'
import FilterChips from '@/components/shared/FilterChips.vue'
import ExpenseTable from '@/components/expenses/ExpenseTable.vue'
import ExpenseForm from '@/components/expenses/ExpenseForm.vue'

const store = useExpenseStore()
const showForm = ref(false)
const editingExpense = ref(null)
const activeFilter = ref('all')

const filterOptions = [
  { key: 'all', label: 'All' },
  { key: 'sealed', label: 'Sealed Product' },
  { key: 'singles', label: 'Singles' },
  { key: 'supplies', label: 'Supplies' },
  { key: 'art-supplies', label: 'Art Supplies' },
  { key: 'others', label: 'Others' },
]

const filteredExpenses = computed(() => {
  if (activeFilter.value === 'all') return store.expenses
  return store.expenses.filter(e => e.category === activeFilter.value)
})
</script>
```

Template: page header with title + "Add Expense" button, FilterChips, ExpenseTable. Opening the form sets `showForm = true`. Saving calls `store.addExpense()` or `store.updateExpense()`. Deleting calls `store.deleteExpense()`.

- [ ] **Step 4: Verify the full expenses flow**

Run: `pnpm dev` — navigate to /expenses, add an expense, verify it appears in the table, filter by category, edit it, delete it. Refresh the page and confirm data persists from localStorage.

- [ ] **Step 5: Commit**

```bash
git add src/components/expenses/ src/pages/ExpensesPage.vue
git commit -m "feat: add expenses page with table, filters, and add/edit form"
```

---

## Task 12: Collection Page

**Files:**
- Create: `src/components/collection/CollectionStats.vue`
- Create: `src/components/collection/CardTile.vue`
- Create: `src/components/collection/SetGroup.vue`
- Create: `src/components/collection/AddCardPanel.vue`
- Modify: `src/pages/CollectionPage.vue`

- [ ] **Step 1: Build CollectionStats component**

Stats bar from mockup: total cards, collection value (green), art pieces value (gold), number of sets. Horizontal flex layout, wraps on mobile. Uses `useCurrency` for formatting.

- [ ] **Step 2: Build CardTile component**

Props: `card: Card`. Renders a card in the grid: image (from `imageUrl`, with fallback placeholder), name, set number + rarity, price (green for regular, gold for art). "Art" badge positioned absolute top-right for art collection cards. Hover: translateY(-4px) + box-shadow + shine animation on image.

- [ ] **Step 3: Build SetGroup component**

Props: `setName: string`, `cards: Card[]`, `isArt?: boolean`. Renders set header (name + card count badge + total value) with border-bottom, then a responsive CardTile grid below (`grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))`). Art collection variant uses gold coloring.

- [ ] **Step 4: Build AddCardPanel component**

Slide-out panel using SlidePanel. Contains:
- Search input (styled with 2px border) — debounced, calls `pokemonTcgApi.searchCards()` on input
- Search results list — each result shows thumbnail, name, set + number, market price in USD
- Click a result to select it (highlighted with green border)
- "Mark as Art Collection" toggle — when on, shows a manual value input (SGD)
- "Add to Collection" button — creates a Card object, converts USD price to SGD via currencyService, calls `collectionStore.addCard()`
- Shows the original USD price and converted SGD price for the selected card

- [ ] **Step 5: Wire up CollectionPage**

Page header with title + "Add Card" button. CollectionStats bar. Two search/filter features: (1) a local search input that filters the user's existing collection by card name, and (2) filter chips ("All Cards", "Art Collection") to toggle between all cards and art-only view. Then iterate `collectionStore.cardsBySet` to render SetGroup components. Separately render art collection SetGroup from `collectionStore.artCollectionCards`. "Art Collection" filter shows only the art section. The API-powered card search lives inside the AddCardPanel slide-out (separate from the local collection search).

- [ ] **Step 6: Verify the full collection flow**

Run: `pnpm dev` — navigate to /collection, click "Add Card", search for a Pokemon card (e.g., "Pikachu"), select a result, see USD→SGD conversion, add it. Verify it appears grouped under its set. Add an art collection card with manual value. Filter to "Art Collection". Refresh page and confirm persistence.

- [ ] **Step 7: Commit**

```bash
git add src/components/collection/ src/pages/CollectionPage.vue
git commit -m "feat: add collection page with set grouping, card search, and art collection"
```

---

## Task 13: Dashboard Page

**Files:**
- Create: `src/components/dashboard/HeroCard.vue`
- Create: `src/components/dashboard/CategoryCards.vue`
- Create: `src/components/dashboard/RecentActivity.vue`
- Create: `src/components/dashboard/TopCards.vue`
- Modify: `src/pages/DashboardPage.vue`

- [ ] **Step 1: Build HeroCard component**

The hero P/L section from the mockup. Uses `analyticsStore.profitLoss` for the big number. Green if positive, red if negative. Shows total spent, collection value, art collection value, cards owned. Thin gradient bar across the top.

- [ ] **Step 2: Build CategoryCards component**

3-column grid (1-column on mobile) showing top spending categories from `expenseStore.spentByCategory`. Each card: category label with colored dot, amount, purchase count. Subtle hover lift.

- [ ] **Step 3: Build RecentActivity component**

Card with title + "View all →" link to /expenses. Shows a combined feed of the last 5 items: recent expenses from `expenseStore.recentExpenses` and recently added cards from `collectionStore` (by `dateAdded`), merged and sorted by date descending. Each expense row: item name, date + category, amount in red. Each card-add row: card name, date + "Added to Collection", value in green.

- [ ] **Step 4: Build TopCards component**

Card with title + "Collection →" link to /collection. Shows `collectionStore.topCards` (top 4). Each row: card thumbnail placeholder, name, set + number, value. Art cards show gold badge and gold price.

- [ ] **Step 5: Wire up DashboardPage**

Page header with "Dashboard" title + current date. Then: HeroCard, CategoryCards, 2-column grid with RecentActivity and TopCards (stacks to 1-column on mobile).

- [ ] **Step 6: Verify dashboard displays real data**

Run: `pnpm dev` — ensure dashboard shows correct P/L from expenses and collection data entered in previous tasks. Add more test data if needed. Verify responsive layout at mobile widths.

- [ ] **Step 7: Commit**

```bash
git add src/components/dashboard/ src/pages/DashboardPage.vue
git commit -m "feat: add dashboard page with P/L hero, category spending, activity, and top cards"
```

---

## Task 14: Analytics Page

**Files:**
- Create: `src/components/analytics/SpendingValueChart.vue`
- Create: `src/components/analytics/CategoryDonut.vue`
- Create: `src/components/analytics/ValueBySet.vue`
- Create: `src/components/analytics/MonthlySpending.vue`
- Create: `src/components/analytics/InsightsPanel.vue`
- Modify: `src/pages/AnalyticsPage.vue`

- [ ] **Step 1: Build SpendingValueChart (line chart)**

Uses Chart.js Line chart via vue-chartjs. Three datasets: cumulative spending (red line), collection value (green line + green fill), art value (gold dashed line). Data from `analyticsStore.spendingOverTime` and `analyticsStore.valueOverTime`. Filtered by the time range prop. Chart.js config: clean grid lines matching the design tokens, JetBrains Mono for axis labels.

- [ ] **Step 2: Build CategoryDonut (donut chart)**

Chart.js Doughnut chart. Segments colored by category. Center text shows total spent. Legend to the right (below on mobile) with category names + amounts. Data from `expenseStore.spentByCategory`.

- [ ] **Step 3: Build ValueBySet (horizontal bars)**

Pure CSS implementation (no Chart.js needed). Each set = a row with name, value, and a colored bar. Width proportional to max value. Data from `collectionStore.valueBySet`. Art collection row in gold.

- [ ] **Step 4: Build MonthlySpending (grouped bar chart)**

Chart.js Bar chart. Grouped bars per month, one bar per category. Colors from `CATEGORY_CONFIG`. Data from `expenseStore.monthlySpending`. Filtered by time range prop.

- [ ] **Step 5: Build InsightsPanel**

Simple card with computed stat rows. Each row: label + value. Stats: most valuable card (name + value), biggest expense (name + amount), average monthly spend (red), collection ROI (green percentage), top spending category (name + percentage). Data from `analyticsStore.insights`.

- [ ] **Step 6: Wire up AnalyticsPage**

Page header with "Analytics" title + time range selector (1M, 3M, 6M, 1Y, All buttons). Time range state passed as prop to chart components. Layout: SpendingValueChart (full width), 2-column grid with CategoryDonut + ValueBySet, MonthlySpending (full width), InsightsPanel (full width). On mobile: all single column.

- [ ] **Step 7: Verify charts render with real data**

Run: `pnpm dev` — navigate to /analytics, verify all charts render correctly with existing data. Test time range filtering. Check mobile layout.

- [ ] **Step 8: Commit**

```bash
git add src/components/analytics/ src/pages/AnalyticsPage.vue
git commit -m "feat: add analytics page with spending/value charts, donut, and insights"
```

---

## Task 15: Final Polish & Integration Testing

**Files:**
- Various components for responsive fixes
- Modify: `src/assets/main.css` for any global tweaks

- [ ] **Step 1: Test full user flow end-to-end**

Run: `pnpm dev` and manually test:
1. Start on Dashboard (empty state — should show $0.00 P/L gracefully)
2. Go to Expenses → add 3-4 expenses across categories
3. Go to Collection → search and add 2-3 cards via API
4. Go to Collection → add an art collection piece with manual SGD value
5. Return to Dashboard → verify P/L, categories, activity, top cards all update
6. Go to Analytics → verify all charts populated
7. Refresh browser → verify all data persists
8. Test at 375px width (mobile) → verify sidebar hidden, bottom nav works, layouts stack

- [ ] **Step 2: Fix any responsive issues found**

Address layout problems at mobile breakpoints: overflowing text, misaligned grids, filter chips scrollability, slide panels taking full width.

- [ ] **Step 3: Run type-check and fix any errors**

Run: `pnpm type-check`
Expected: Clean pass with no errors.

- [ ] **Step 4: Run all unit tests**

Run: `pnpm test:unit --run`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "polish: responsive fixes and integration verification"
```

---

## Dependency Graph

```
Task 1 (deps)
  └→ Task 2 (types + CSS)
       ├→ Task 3 (storage) ─→ Task 6 (expense store) ─→ Task 8 (analytics store)
       ├→ Task 4 (currency) ─┘                          ↑
       ├→ Task 5 (API) ─→ Task 7 (collection store) ────┘
       └→ Task 9 (layout + router)
            └→ Task 10 (shared components)
                 ├→ Task 11 (expenses page)
                 ├→ Task 12 (collection page)
                 ├→ Task 13 (dashboard page) ← needs stores from 6,7,8
                 └→ Task 14 (analytics page) ← needs store from 8
                      └→ Task 15 (polish)
```

Tasks 3, 4, 5 can be done in parallel after Task 2.
Tasks 6, 7 can be done in parallel after their dependencies.
Tasks 11, 12 can be done in parallel after Task 10.
Task 13 needs stores 6, 7, 8 complete.
Task 14 needs store 8 complete.
