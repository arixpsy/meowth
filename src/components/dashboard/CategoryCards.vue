<script setup lang="ts">
import { computed } from 'vue'
import { useExpenseStore } from '@/stores/expenseStore'
import { CATEGORY_CONFIG } from '@/types/expense'
import type { ExpenseCategory } from '@/types/expense'
import { formatSgd } from '@/services/currencyService'

const store = useExpenseStore()

const topCategories = computed(() => {
  const entries = (Object.entries(store.spentByCategory) as [ExpenseCategory, number][])
    .filter(([, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return entries.map(([category, amount]) => {
    const count = store.expenses.filter(e => e.category === category).length
    return {
      category,
      amount,
      count,
      label: CATEGORY_CONFIG[category].label,
      color: CATEGORY_CONFIG[category].color,
    }
  })
})
</script>

<template>
  <div class="category-cards" v-if="topCategories.length > 0">
    <div
      v-for="item in topCategories"
      :key="item.category"
      class="category-card"
    >
      <div class="category-header">
        <span class="dot" :style="{ background: item.color }" />
        <span class="category-label">{{ item.label }}</span>
      </div>
      <p class="category-amount mono">{{ formatSgd(item.amount) }}</p>
      <p class="category-count">{{ item.count }} {{ item.count === 1 ? 'purchase' : 'purchases' }}</p>
    </div>
  </div>

  <div class="category-cards category-cards--empty" v-else>
    <p class="empty-text">No spending data yet.</p>
  </div>
</template>

<style scoped>
.category-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.category-cards--empty {
  grid-template-columns: 1fr;
  padding: 32px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.category-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  cursor: default;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.category-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.category-amount {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.category-count {
  font-size: 12px;
  color: var(--text-muted);
}

.empty-text {
  font-size: 14px;
  color: var(--text-muted);
  text-align: center;
}

@media (max-width: 767px) {
  .category-cards {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .category-card {
    padding: 16px 18px;
    gap: 6px;
  }

  .category-amount {
    font-size: 18px;
  }
}
</style>
