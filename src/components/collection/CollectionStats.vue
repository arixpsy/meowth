<script setup lang="ts">
import { formatSgd } from '@/services/currencyService'

defineProps<{
  totalCards: number
  collectionValue: number
  artValue: number
  setCount: number
}>()
</script>

<template>
  <div class="stats-bar">
    <div class="stat-item">
      <span class="stat-label">Total Cards</span>
      <span class="stat-value mono">{{ totalCards }}</span>
    </div>
    <div class="stat-divider" />
    <div class="stat-item">
      <span class="stat-label">Collection Value</span>
      <span class="stat-value mono value-green">{{ formatSgd(collectionValue) }}</span>
    </div>
    <div class="stat-divider" />
    <div class="stat-item">
      <span class="stat-label">Art Pieces Value</span>
      <span class="stat-value mono value-gold">{{ formatSgd(artValue) }}</span>
    </div>
    <div class="stat-divider" />
    <div class="stat-item">
      <span class="stat-label">Sets</span>
      <span class="stat-value mono">{{ setCount }}</span>
    </div>
  </div>
</template>

<style scoped>
.stats-bar {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px 24px;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 120px;
  padding: 4px 16px;
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
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 20px;
  font-weight: 500;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.value-green {
  color: var(--accent);
}

.value-gold {
  color: var(--gold);
}

@media (max-width: 600px) {
  .stats-bar {
    gap: 16px;
    padding: 16px;
  }

  .stat-divider {
    display: none;
  }

  .stat-item {
    flex: 1 1 calc(50% - 8px);
    padding: 0;
  }

  .stat-value {
    font-size: 17px;
  }
}
</style>
