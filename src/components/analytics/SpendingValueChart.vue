<script setup lang="ts">
import { computed } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { useAnalyticsStore } from '@/stores/analyticsStore'

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const props = defineProps<{
  timeRange: string
}>()

const analyticsStore = useAnalyticsStore()

function getMonthsBack(range: string): number | null {
  switch (range) {
    case '1M': return 1
    case '3M': return 3
    case '6M': return 6
    case '1Y': return 12
    default: return null
  }
}

function filterByTimeRange<T extends { month: string }>(data: T[]): T[] {
  const monthsBack = getMonthsBack(props.timeRange)
  if (monthsBack === null || data.length === 0) return data

  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - monthsBack)
  const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}`

  return data.filter((d) => d.month >= cutoffStr)
}

const chartData = computed<ChartData<'line'>>(() => {
  const spending = filterByTimeRange(analyticsStore.spendingOverTime)
  const value = filterByTimeRange(analyticsStore.valueOverTime)

  // Build a unified label set
  const allMonths = Array.from(
    new Set([...spending.map((d) => d.month), ...value.map((d) => d.month)]),
  ).sort()

  const spendingMap = new Map(spending.map((d) => [d.month, d.cumulative]))
  const valueMap = new Map(value.map((d) => [d.month, d.value]))

  return {
    labels: allMonths.map((m) => {
      const [year, month] = m.split('-')
      return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      })
    }),
    datasets: [
      {
        label: 'Cumulative Spending',
        data: allMonths.map((m) => spendingMap.get(m) ?? null),
        borderColor: '#c44033',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
      {
        label: 'Collection Value',
        data: allMonths.map((m) => valueMap.get(m) ?? null),
        borderColor: '#2d5a27',
        backgroundColor: 'rgba(45, 90, 39, 0.08)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
      {
        label: 'Art Value',
        data: allMonths.map((m) => valueMap.get(m) ?? null),
        borderColor: '#b8860b',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        borderDash: [5, 4],
      },
    ],
  }
})

const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.dataset.label}: $${Number(ctx.raw ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      },
    },
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        color: '#f0eeea',
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
</script>

<template>
  <div class="chart-wrap">
    <div v-if="analyticsStore.spendingOverTime.length === 0" class="empty-state">
      <p class="empty-text">No spending data yet.</p>
    </div>
    <Line v-else :data="chartData" :options="chartOptions" />

    <div class="legend">
      <span class="legend-item">
        <span class="legend-dot legend-dot--spending"></span>
        Cumulative Spending
      </span>
      <span class="legend-item">
        <span class="legend-dot legend-dot--value"></span>
        Collection Value
      </span>
      <span class="legend-item">
        <span class="legend-dot legend-dot--art legend-dot--dashed"></span>
        Art Value
      </span>
    </div>
  </div>
</template>

<style scoped>
.chart-wrap {
  position: relative;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.empty-text {
  font-size: 14px;
  color: var(--text-muted);
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.legend-dot {
  width: 20px;
  height: 2px;
  border-radius: 1px;
  flex-shrink: 0;
}

.legend-dot--spending {
  background: #c44033;
}

.legend-dot--value {
  background: #2d5a27;
}

.legend-dot--art {
  background: #b8860b;
}

.legend-dot--dashed {
  background: repeating-linear-gradient(
    to right,
    #b8860b 0,
    #b8860b 5px,
    transparent 5px,
    transparent 9px
  );
}
</style>
