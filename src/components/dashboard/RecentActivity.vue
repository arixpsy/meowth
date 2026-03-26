<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useExpenseStore } from '@/stores/expenseStore'
import { useCollectionStore } from '@/stores/collectionStore'
import { CATEGORY_CONFIG } from '@/types/expense'
import { formatSgd } from '@/services/currencyService'

const expenseStore = useExpenseStore()
const collectionStore = useCollectionStore()

type ActivityItem =
  | { type: 'expense'; id: string; name: string; date: string; category: string; amount: number }
  | { type: 'card'; id: string; name: string; date: string; value: number }

const activityFeed = computed<ActivityItem[]>(() => {
  const expenseItems: ActivityItem[] = expenseStore.expenses.map(e => ({
    type: 'expense',
    id: e.id,
    name: e.itemName,
    date: e.date,
    category: e.category,
    amount: e.amount,
  }))

  const cardItems: ActivityItem[] = [...collectionStore.cards]
    .sort((a, b) => b.dateAdded.localeCompare(a.dateAdded))
    .slice(0, 5)
    .map(c => ({
      type: 'card',
      id: c.id,
      name: c.name,
      date: c.dateAdded,
      value: c.isArtCollection ? (c.artValue ?? 0) : c.marketPriceSgd,
    }))

  return [...expenseItems, ...cardItems]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
})

function formatDate(iso: string): string {
  const parts = iso.split('-').map(Number)
  const d = new Date(parts[0]!, parts[1]! - 1, parts[2])
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="activity-card">
    <div class="card-header">
      <h2 class="card-title">Recent Activity</h2>
      <RouterLink to="/expenses" class="view-link">View all →</RouterLink>
    </div>

    <div class="activity-list" v-if="activityFeed.length > 0">
      <div
        v-for="item in activityFeed"
        :key="item.id"
        class="activity-row"
      >
        <div class="row-main">
          <p class="row-name">{{ item.name }}</p>
          <p class="row-meta">
            <span>{{ formatDate(item.date) }}</span>
            <span class="meta-sep">·</span>
            <span v-if="item.type === 'expense'">
              {{ CATEGORY_CONFIG[item.category as keyof typeof CATEGORY_CONFIG].label }}
            </span>
            <span v-else>Added to Collection</span>
          </p>
        </div>
        <div class="row-value">
          <span
            v-if="item.type === 'expense'"
            class="mono value-red"
          >−{{ formatSgd(item.amount) }}</span>
          <span
            v-else
            class="mono value-green"
          >{{ formatSgd(item.value) }}</span>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <p class="empty-text">No activity yet.</p>
    </div>
  </div>
</template>

<style scoped>
.activity-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--border-light);
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text-primary);
}

.view-link {
  font-size: 13px;
  color: var(--accent);
  font-weight: 500;
  transition: opacity 0.12s ease;
}

.view-link:hover {
  opacity: 0.75;
}

.activity-list {
  display: flex;
  flex-direction: column;
}

.activity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 20px;
  border-bottom: 1px solid var(--border-light);
  transition: background 0.12s ease;
}

.activity-row:last-child {
  border-bottom: none;
}

.activity-row:hover {
  background: var(--bg);
}

.row-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.row-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}

.meta-sep {
  opacity: 0.5;
}

.row-value {
  flex-shrink: 0;
}

.value-red {
  font-size: 13px;
  font-weight: 600;
  color: var(--negative);
}

.value-green {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.empty-text {
  font-size: 13px;
  color: var(--text-muted);
}
</style>
