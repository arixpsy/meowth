<script setup lang="ts">
import { computed } from 'vue'
import {
  Chart,
  ArcElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import { useExpenseStore } from '@/stores/expenseStore'
import { CATEGORY_CONFIG, EXPENSE_CATEGORIES } from '@/types/expense'
import { formatSgd } from '@/services/currencyService'

Chart.register(ArcElement, Tooltip)

const expenseStore = useExpenseStore()

const categories = EXPENSE_CATEGORIES

const chartData = computed<ChartData<'doughnut'>>(() => ({
  labels: categories.map((cat) => CATEGORY_CONFIG[cat].label),
  datasets: [
    {
      data: categories.map((cat) => expenseStore.spentByCategory[cat]),
      backgroundColor: categories.map((cat) => CATEGORY_CONFIG[cat].color),
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverBorderWidth: 3,
    },
  ],
}))

const chartOptions = computed<ChartOptions<'doughnut'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.label}: ${formatSgd(ctx.raw as number)}`,
      },
    },
    legend: {
      display: false,
    },
  },
}))

const totalSpent = computed(() => expenseStore.totalSpent)

const legendItems = computed(() =>
  categories
    .map((cat) => ({
      label: CATEGORY_CONFIG[cat].label,
      color: CATEGORY_CONFIG[cat].color,
      amount: expenseStore.spentByCategory[cat],
    }))
    .filter((item) => item.amount > 0),
)
</script>

<template>
  <div class="donut-wrap">
    <div class="chart-area">
      <div class="donut-container">
        <Doughnut v-if="totalSpent > 0" :data="chartData" :options="chartOptions" />
        <div v-else class="empty-state">
          <p class="empty-text">No spending data.</p>
        </div>
        <div v-if="totalSpent > 0" class="center-text">
          <span class="center-label">Total</span>
          <span class="center-value mono">{{ formatSgd(totalSpent) }}</span>
        </div>
      </div>
    </div>

    <div class="legend">
      <div
        v-for="item in legendItems"
        :key="item.label"
        class="legend-row"
      >
        <div class="legend-left">
          <span class="legend-dot" :style="{ background: item.color }"></span>
          <span class="legend-label">{{ item.label }}</span>
        </div>
        <span class="legend-amount mono">{{ formatSgd(item.amount) }}</span>
      </div>
      <div v-if="legendItems.length === 0" class="legend-empty">
        <span class="empty-text">Add expenses to see breakdown.</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.donut-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-area {
  display: flex;
  justify-content: center;
}

.donut-container {
  position: relative;
  width: 180px;
  height: 180px;
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 180px;
}

.empty-text {
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
}

.center-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.center-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

.center-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.legend-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.legend-amount {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.legend-empty {
  padding: 8px 0;
}
</style>
