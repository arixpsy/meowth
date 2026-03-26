<script setup lang="ts">
import { computed } from 'vue'
import { useAnalyticsStore } from '@/stores/analyticsStore'
import { useExpenseStore } from '@/stores/expenseStore'
import { CATEGORY_CONFIG } from '@/types/expense'
import { formatSgd } from '@/services/currencyService'

const analyticsStore = useAnalyticsStore()
const expenseStore = useExpenseStore()

const insights = computed(() => analyticsStore.insights)

const mostValuableCard = computed(() => {
  const card = insights.value.mostValuableCard
  if (!card) return null
  const value = card.isArtCollection ? (card.artValue ?? 0) : card.marketPriceSgd
  return { name: card.name, value }
})

const biggestExpense = computed(() => {
  const exp = insights.value.biggestExpense
  if (!exp) return null
  return { name: exp.itemName, amount: exp.amount }
})

const avgMonthlySpend = computed(() => insights.value.avgMonthlySpend)

const roi = computed(() => insights.value.roi)

const topCategoryInfo = computed(() => {
  const cat = insights.value.topCategory
  if (!cat) return null

  const totalSpent = expenseStore.totalSpent
  const catAmount = expenseStore.spentByCategory[cat]
  const pct = totalSpent > 0 ? (catAmount / totalSpent) * 100 : 0

  return {
    label: CATEGORY_CONFIG[cat].label,
    percent: pct,
  }
})
</script>

<template>
  <div class="insights-panel">
    <div class="insight-row">
      <span class="insight-label">Most Valuable Card</span>
      <div v-if="mostValuableCard" class="insight-value-wrap">
        <span class="insight-name">{{ mostValuableCard.name }}</span>
        <span class="insight-value insight-value--positive mono">{{ formatSgd(mostValuableCard.value) }}</span>
      </div>
      <span v-else class="insight-value insight-value--muted">—</span>
    </div>

    <div class="divider"></div>

    <div class="insight-row">
      <span class="insight-label">Biggest Expense</span>
      <div v-if="biggestExpense" class="insight-value-wrap">
        <span class="insight-name">{{ biggestExpense.name }}</span>
        <span class="insight-value insight-value--negative mono">{{ formatSgd(biggestExpense.amount) }}</span>
      </div>
      <span v-else class="insight-value insight-value--muted">—</span>
    </div>

    <div class="divider"></div>

    <div class="insight-row">
      <span class="insight-label">Avg Monthly Spend</span>
      <span class="insight-value insight-value--negative mono">{{ formatSgd(avgMonthlySpend) }}</span>
    </div>

    <div class="divider"></div>

    <div class="insight-row">
      <span class="insight-label">Collection ROI</span>
      <span
        class="insight-value mono"
        :class="roi >= 0 ? 'insight-value--positive' : 'insight-value--negative'"
      >
        {{ roi >= 0 ? '+' : '' }}{{ roi.toFixed(1) }}%
      </span>
    </div>

    <div class="divider"></div>

    <div class="insight-row">
      <span class="insight-label">Top Spending Category</span>
      <div v-if="topCategoryInfo" class="insight-value-wrap">
        <span class="insight-value insight-value--neutral">{{ topCategoryInfo.label }}</span>
        <span class="insight-pct mono">{{ topCategoryInfo.percent.toFixed(0) }}% of total</span>
      </div>
      <span v-else class="insight-value insight-value--muted">—</span>
    </div>
  </div>
</template>

<style scoped>
.insights-panel {
  display: flex;
  flex-direction: column;
}

.insight-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
}

.insight-label {
  font-size: 14px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.insight-value-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.insight-name {
  font-size: 12px;
  color: var(--text-muted);
  text-align: right;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.insight-pct {
  font-size: 12px;
  color: var(--text-muted);
}

.insight-value {
  font-size: 15px;
  font-weight: 600;
}

.insight-value--positive {
  color: var(--accent);
}

.insight-value--negative {
  color: var(--negative);
}

.insight-value--neutral {
  color: var(--text-primary);
}

.insight-value--muted {
  color: var(--text-muted);
  font-weight: 400;
}

.divider {
  height: 1px;
  background: var(--border-light);
}
</style>
