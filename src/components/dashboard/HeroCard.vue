<script setup lang="ts">
import { useAnalyticsStore } from '@/stores/analyticsStore'
import { useExpenseStore } from '@/stores/expenseStore'
import { useCollectionStore } from '@/stores/collectionStore'
import { formatSgd } from '@/services/currencyService'

const analytics = useAnalyticsStore()
const expenses = useExpenseStore()
const collection = useCollectionStore()
</script>

<template>
  <div class="hero-card">
    <div class="gradient-bar" />

    <div class="hero-body">
      <div class="pl-section">
        <p class="pl-label">{{ analytics.profitLoss >= 0 ? 'Total Profit' : 'Total Loss' }}</p>
        <p
          class="pl-number heading-serif"
          :class="analytics.profitLoss >= 0 ? 'pl-positive' : 'pl-negative'"
        >
          {{ formatSgd(Math.abs(analytics.profitLoss)) }}
        </p>
      </div>

      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-label">Total Spent</span>
          <span class="stat-value mono stat-red">{{ formatSgd(expenses.totalSpent) }}</span>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <span class="stat-label">Collection Value</span>
          <span class="stat-value mono stat-green">{{ formatSgd(collection.totalValue) }}</span>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <span class="stat-label">Art Collection</span>
          <span class="stat-value mono stat-gold">{{ formatSgd(collection.artCollectionValue) }}</span>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <span class="stat-label">Cards Owned</span>
          <span class="stat-value mono">{{ collection.cards.length }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.gradient-bar {
  height: 4px;
  background: linear-gradient(90deg, var(--accent) 0%, var(--gold) 50%, var(--accent) 100%);
}

.hero-body {
  padding: 28px 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.pl-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pl-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.pl-number {
  font-size: 52px;
  line-height: 1;
  letter-spacing: -0.02em;
}

.pl-positive {
  color: var(--accent);
}

.pl-negative {
  color: var(--negative);
}

.stats-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  border-top: 1px solid var(--border-light);
  padding-top: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 110px;
  padding: 0 20px;
}

.stat-item:first-child {
  padding-left: 0;
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: var(--border);
  flex-shrink: 0;
}

.stat-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.stat-value {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.stat-red {
  color: var(--negative);
}

.stat-green {
  color: var(--accent);
}

.stat-gold {
  color: var(--gold);
}

@media (max-width: 767px) {
  .hero-body {
    padding: 20px 20px 18px;
    gap: 18px;
  }

  .pl-number {
    font-size: 38px;
  }

  .stats-row {
    gap: 14px;
  }

  .stat-divider {
    display: none;
  }

  .stat-item {
    flex: 1 1 calc(50% - 7px);
    padding: 0;
    min-width: 0;
  }

  .stat-value {
    font-size: 14px;
  }
}
</style>
