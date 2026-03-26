<script setup lang="ts">
import { computed } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import { useExpenseStore } from '@/stores/expenseStore'
import { CATEGORY_CONFIG, EXPENSE_CATEGORIES } from '@/types/expense'
import { formatSgd } from '@/services/currencyService'

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip)

const props = defineProps<{
  timeRange: string
}>()

const expenseStore = useExpenseStore()

function getMonthsBack(range: string): number | null {
  switch (range) {
    case '1M': return 1
    case '3M': return 3
    case '6M': return 6
    case '1Y': return 12
    default: return null
  }
}

const filteredMonthly = computed(() => {
  const monthsBack = getMonthsBack(props.timeRange)
  if (monthsBack === null || expenseStore.monthlySpending.length === 0) {
    return expenseStore.monthlySpending
  }

  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - monthsBack)
  const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}`

  return expenseStore.monthlySpending.filter((d) => d.month >= cutoffStr)
})

const chartData = computed<ChartData<'bar'>>(() => {
  const data = filteredMonthly.value

  return {
    labels: data.map((d) => {
      const [year, month] = d.month.split('-')
      return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      })
    }),
    datasets: EXPENSE_CATEGORIES.map((cat) => ({
      label: CATEGORY_CONFIG[cat].label,
      data: data.map((d) => d[cat]),
      backgroundColor: CATEGORY_CONFIG[cat].color,
      borderRadius: 3,
      borderSkipped: false,
    })),
  }
})

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.dataset.label}: ${formatSgd(ctx.raw as number)}`,
      },
    },
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          family: "'JetBrains Mono', monospace",
          size: 11,
        },
        color: '#9a9a9a',
      },
      border: {
        color: '#e8e6e1',
      },
    },
    y: {
      grid: {
        color: '#f0eeea',
      },
      ticks: {
        font: {
          family: "'JetBrains Mono', monospace",
          size: 11,
        },
        color: '#9a9a9a',
        callback: (val) => `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
      },
      border: {
        color: '#e8e6e1',
      },
    },
  },
}))

const legendItems = EXPENSE_CATEGORIES.map((cat) => ({
  label: CATEGORY_CONFIG[cat].label,
  color: CATEGORY_CONFIG[cat].color,
}))
</script>

<template>
  <div class="monthly-wrap">
    <div class="chart-container">
      <div v-if="filteredMonthly.length === 0" class="empty-state">
        <p class="empty-text">No spending data for this period.</p>
      </div>
      <Bar v-else :data="chartData" :options="chartOptions" />
    </div>

    <div class="legend">
      <div
        v-for="item in legendItems"
        :key="item.label"
        class="legend-item"
      >
        <span class="legend-dot" :style="{ background: item.color }"></span>
        <span class="legend-label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.monthly-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-container {
  min-height: 260px;
  position: relative;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 260px;
}

.empty-text {
  font-size: 14px;
  color: var(--text-muted);
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-label {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
