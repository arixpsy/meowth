# Meowth — Pokemon Card Expense & Collection Tracker

## Overview

A web application for tracking Pokemon card hobby expenses and collection value. The core question it answers: **am I making or losing money on this hobby?**

The app tracks individual purchases across categories, maintains a card collection with API-powered pricing, supports a separate art collection with manual valuations, and provides analytics from a simple P/L number down to monthly trend charts.

## Tech Stack

- **Framework:** Vue 3 + TypeScript
- **Build:** Vite
- **State Management:** Pinia
- **Routing:** Vue Router (web history mode)
- **Data Persistence:** localStorage (architected behind a data-access layer so a backend can be swapped in later)
- **Card Data:** Pokemon TCG API (https://pokemontcg.io) for card search, set info, and market prices
- **Charts:** Chart.js or a lightweight alternative (e.g., unovis, lightweight SVG)
- **Future:** PWA-ready (vite-plugin-pwa), responsive/mobile-first design

## Design Language

- **Aesthetic:** Modern, Awwwards-quality. Clean, light theme.
- **Background:** Warm off-white (`#f6f5f1`) with white cards
- **Typography:** Instrument Serif (headings), DM Sans (body), JetBrains Mono (numbers/data)
- **Color Palette:**
  - Primary text: `#1a1a1a`
  - Accent green (profit/value): `#2d5a27`
  - Negative red (spending): `#c44033`
  - Gold (art collection): `#b8860b`
  - Blue (supplies): `#5b7bd5`
  - Muted gray (others): `#9a9a9a`
  - Borders: `#e8e6e1`
- **Layout:** Sidebar navigation on desktop, collapses on mobile
- **Interactions:** Subtle hover lifts, shine effects on card images, smooth transitions

## Pages

### 1. Dashboard (Landing Page)

The first thing the user sees. Answers "am I up or down?" at a glance.

**Components:**
- **Hero P/L Card** — dominant element. Shows total profit/loss as a large number (green if positive, red if negative). Below it: total spent, collection value, art collection value, cards owned. Thin gradient accent bar across the top (green → gold → green).
- **Category Spending Cards** — 3-column grid showing spend per category with purchase counts. Categories: Sealed Product, Supplies, Art Supplies (top 3 shown; others accessible via Expenses page).
- **Recent Activity** — last 4-5 transactions (expenses + card additions) with date, category, and amount.
- **Top Cards** — most valuable cards in the collection with set info and value. Art collection items show a gold "Art" badge.

### 2. Expenses

Log and browse individual purchases.

**Components:**
- **Add Expense Button** — opens a slide-out panel from the right.
- **Filter Chips** — All, Sealed Product, Singles, Supplies, Art Supplies, Others. Horizontally scrollable on mobile.
- **Expense Table** — columns: Date, Item Name, Category (color-coded dot + label), Amount, Actions (edit/delete via `···` menu). On mobile: collapses to Date, Item, Amount.
- **Add Expense Form (slide-out panel):**
  - Item Name (text input)
  - Category (tappable tile grid: Sealed, Singles, Supplies, Art Supplies, Others)
  - Amount (currency input)
  - Date (date picker, defaults to today)
  - Notes (optional text input)
  - Save button

**Expense Categories:**
| Category | Color | Description |
|----------|-------|-------------|
| Sealed Product | Red (`#c44033`) | Booster packs, ETBs, booster boxes, tins |
| Singles | Green (`#2d5a27`) | Individual card purchases |
| Supplies | Blue (`#5b7bd5`) | Card sleeves, top loaders, binders |
| Art Supplies | Gold (`#b8860b`) | Tools and materials for 3D card art |
| Others | Gray (`#9a9a9a`) | Anything that doesn't fit above |

**Note:** Expenses and Collection are intentionally independent. Adding a card to the collection does not auto-create a Singles expense (and vice versa). The user manually logs both — this keeps the data model simple and avoids assumptions about purchase intent (e.g., a card pulled from a pack isn't a singles purchase).

### 3. Collection

Browse and manage the card collection, grouped by set.

**Components:**
- **Stats Bar** — total cards, collection value, art pieces value, number of sets.
- **Search + Filter Toolbar** — search input to filter existing collection; filter chips for "All Cards" and "Art Collection".
- **Set Groups** — each set displays as a section with: set name, card count badge, total set value. Cards within shown as a responsive grid.
- **Card Tiles** — each card shows: image placeholder (from API), card name, set number/rarity, market price. Hover: lift + shine animation. Art collection cards show a gold "Art" badge and gold-colored price (manual value).
- **Art Collection Group** — shown as its own section with gold styling, separate from TCG sets.
- **Add Card (slide-out panel):**
  - Search input (queries Pokemon TCG API)
  - Search results list with: card thumbnail, name, set + number, market price
  - Select a result to stage it
  - Toggle: "Mark as Art Collection" — when enabled, reveals a manual value input
  - Add to Collection button

**Expense Data Model:**
- `id`: unique identifier
- `itemName`: name of the purchased item
- `category`: one of `sealed`, `singles`, `supplies`, `art-supplies`, `others`
- `amount`: cost in dollars
- `date`: purchase date
- `notes`: optional freeform text

**Card Data Model:**
- `id`: unique identifier
- `pokemonTcgId`: API card ID (for price updates)
- `name`: card name
- `setName`: set name
- `setId`: set ID
- `number`: card number in set
- `rarity`: rarity string
- `imageUrl`: card image URL from API
- `marketPrice`: market price snapshot captured at time of adding (v1 does not auto-refresh; future feature)
- `isArtCollection`: boolean flag
- `artValue`: manual value (only when isArtCollection is true)
- `dateAdded`: when the card was added

### 4. Analytics

Deep dive into spending and collection trends.

**Components:**
- **Time Range Selector** — 1M, 3M, 6M, 1Y, All. Scopes all charts on the page.
- **Spending vs Collection Value (line chart)** — three lines: cumulative spending (red), collection value (green), art collection value (gold dashed). Green fill beneath collection value line when above spending line to visualize profit.
- **Spending by Category (donut chart)** — proportional breakdown of all expense categories with legend showing amounts.
- **Value by Set (horizontal bar chart)** — which sets and art collection hold the most value, sorted by value descending.
- **Monthly Spending (grouped bar chart)** — bars per month, grouped by category with color coding.
- **Insights Panel** — computed stats: most valuable card, biggest single expense, average monthly spend, collection ROI percentage, top spending category.

## Data Architecture

### Pinia Stores

**expenseStore**
- State: `expenses: Expense[]`
- Actions: `addExpense`, `updateExpense`, `deleteExpense`
- Getters: `totalSpent`, `spentByCategory`, `recentExpenses`, `monthlySpending`

**collectionStore**
- State: `cards: Card[]`
- Actions: `addCard`, `updateCard`, `removeCard`
- Getters: `totalValue`, `artCollectionValue`, `cardsBySet`, `artCollectionCards`, `topCards`, `valueBySet`

**analyticsStore** (derived from the above two)
- Getters: `profitLoss`, `roi`, `spendingOverTime`, `valueOverTime`, `insights`

### Data Persistence Layer

A `storage` module that wraps localStorage behind an interface:

```typescript
interface DataStore {
  getExpenses(): Expense[]
  saveExpenses(expenses: Expense[]): void
  getCards(): Card[]
  saveCards(cards: Card[]): void
}
```

Each Pinia store calls through this interface. When a backend is added later, only this module needs to change — swap `localStorage.getItem/setItem` for API calls.

### Pokemon TCG API Integration

A `pokemonTcgApi` service module:
- `searchCards(query: string): Promise<Card[]>` — search by name
- `getCard(id: string): Promise<Card>` — get single card with pricing
- `getSets(): Promise<Set[]>` — list all sets

The API is free and doesn't require authentication for basic usage. Rate limit: 1000 requests/day without an API key, 30,000/day with a free key.

### Currency

The app operates in **SGD (Singapore Dollars)** as the primary display currency.

- **Expenses:** All entered and stored in SGD.
- **Art collection values:** Manually entered in SGD.
- **Card market prices:** The Pokemon TCG API returns prices in USD. When a card is added, the USD price is stored as `marketPriceUsd`. A `currencyService` module converts USD → SGD for display and P/L calculations.
- **P/L calculation:** Total spent (SGD) vs. total collection value (card market prices converted to SGD + art collection values already in SGD).
- **Exchange rate source:** A free API (e.g., exchangerate-api.com or a similar free tier service). The rate is fetched on app load and cached in localStorage with a TTL (e.g., refresh once per day). If the fetch fails, fall back to the last cached rate.
- **Display:** All monetary values shown in SGD with `$` prefix throughout the app. The card detail / add-card panel can show the original USD market price as secondary info.

**Card Data Model update:**
- `marketPriceUsd`: market price in USD from API (snapshot at time of adding)
- `marketPriceSgd`: converted SGD value (recalculated when exchange rate updates)

## Responsive Design

**Desktop (>1024px):** Sidebar navigation (240px), full content area with multi-column layouts.

**Tablet (768–1024px):** Sidebar collapses to icon-only or hamburger menu. Grids reduce columns.

**Mobile (<768px):** Sidebar hidden entirely (bottom tab bar or hamburger). Single-column layouts. Slide-out panels go full-width. Table columns collapse to essentials. Filter chips horizontally scroll. Card grid goes to 2 columns.

## Future Considerations (Not in Scope)

- **PWA conversion** — add `vite-plugin-pwa` for offline support, service worker, app manifest. Architecture supports this (localStorage works offline).
- **Backend migration** — swap the `DataStore` interface implementation from localStorage to REST/GraphQL calls.
- **Price auto-refresh** — periodic API calls to update market prices for collection cards.
- **Export/Import** — JSON export of all data for backup.
