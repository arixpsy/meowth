<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useCollectionStore } from '@/stores/collectionStore'
import { formatSgd } from '@/services/currencyService'

const collectionStore = useCollectionStore()
const mounted = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    mounted.value = true
  })
})

const maxValue = computed(() => {
  const values = collectionStore.valueBySet.map((s) => s.value)
  return values.length > 0 ? Math.max(...values) : 1
})

function barWidth(value: number): string {
  if (!mounted.value) return '0%'
  const pct = (value / maxValue.value) * 100
  return `${Math.max(pct, 1)}%`
}

function isArt(setName: string): boolean {
  return setName === 'Art Collection'
}
</script>

<template>
  <div class="value-by-set">
    <div v-if="collectionStore.valueBySet.length === 0" class="empty-state">
      <p class="empty-text">No cards in collection yet.</p>
    </div>

    <div
      v-for="row in collectionStore.valueBySet"
      :key="row.setName"
      class="set-row"
    >
      <div class="row-header">
        <span class="set-name" :class="{ 'set-name--art': isArt(row.setName) }">
          {{ row.setName }}
        </span>
        <span class="set-value mono" :class="{ 'set-value--art': isArt(row.setName) }">
          {{ formatSgd(row.value) }}
        </span>
      </div>
      <div class="bar-track">
        <div
          class="bar-fill"
          :class="{ 'bar-fill--art': isArt(row.setName) }"
          :style="{ width: barWidth(row.value) }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.value-by-set {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.empty-state {
  padding: 24px 0;
  text-align: center;
}

.empty-text {
  font-size: 13px;
  color: var(--text-muted);
}

.set-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.row-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.set-name {
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.set-name--art {
  color: var(--gold);
}

.set-value {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.set-value--art {
  color: var(--gold);
}

.bar-track {
  height: 8px;
  background: var(--border-light);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  background: var(--accent);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.bar-fill--art {
  background: var(--gold);
}
</style>
