<script setup lang="ts">
import { ref } from 'vue'
import SpendingValueChart from '@/components/analytics/SpendingValueChart.vue'
import CategoryDonut from '@/components/analytics/CategoryDonut.vue'
import ValueBySet from '@/components/analytics/ValueBySet.vue'
import MonthlySpending from '@/components/analytics/MonthlySpending.vue'
import InsightsPanel from '@/components/analytics/InsightsPanel.vue'

const TIME_RANGES = ['1M', '3M', '6M', '1Y', 'All'] as const
type TimeRange = (typeof TIME_RANGES)[number]

const selectedRange = ref<TimeRange>('3M')
</script>

<template>
  <div class="analytics-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title heading-serif">Analytics</h1>
      <div class="time-range-group" role="group" aria-label="Time range">
        <button
          v-for="range in TIME_RANGES"
          :key="range"
          class="range-btn"
          :class="{ 'range-btn--active': selectedRange === range }"
          @click="selectedRange = range"
        >
          {{ range }}
        </button>
      </div>
    </div>

    <!-- Spending vs Value Line Chart -->
    <div class="card chart-card">
      <h2 class="card-title">Spending vs. Collection Value</h2>
      <SpendingValueChart :time-range="selectedRange" />
    </div>

    <!-- 2-Column Grid: Category Donut + Value by Set -->
    <div class="two-col">
      <div class="card">
        <h2 class="card-title">Spending by Category</h2>
        <CategoryDonut />
      </div>
      <div class="card">
        <h2 class="card-title">Value by Set</h2>
        <ValueBySet />
      </div>
    </div>

    <!-- Monthly Spending Bar Chart -->
    <div class="card chart-card">
      <h2 class="card-title">Monthly Spending</h2>
      <MonthlySpending :time-range="selectedRange" />
    </div>

    <!-- Insights Panel -->
    <div class="card">
      <h2 class="card-title">Insights</h2>
      <InsightsPanel />
    </div>
  </div>
</template>

<style scoped>
.analytics-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 20px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.page-title {
  font-size: 28px;
  color: var(--text-primary);
  line-height: 1.2;
}

/* Time Range Pill Group */
.time-range-group {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 3px;
  gap: 2px;
}

.range-btn {
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  white-space: nowrap;
}

.range-btn:hover {
  color: var(--text-primary);
  background: var(--bg);
}

.range-btn--active {
  background: var(--text-primary);
  color: #ffffff;
}

.range-btn--active:hover {
  background: var(--text-primary);
  color: #ffffff;
}

/* Cards */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.01em;
  margin-bottom: 20px;
}

.chart-card {
  /* chart components need explicit height context */
}

/* 2-Column grid */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* Mobile */
@media (max-width: 639px) {
  .analytics-page {
    padding: 16px 16px 40px;
    gap: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .two-col {
    grid-template-columns: 1fr;
  }

  .card {
    padding: 18px;
  }

  .range-btn {
    padding: 5px 10px;
    font-size: 11px;
  }
}
</style>
