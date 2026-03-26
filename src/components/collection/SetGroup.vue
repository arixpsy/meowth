<script setup lang="ts">
import { computed } from 'vue'
import type { Card } from '@/types/card'
import { formatSgd } from '@/services/currencyService'
import CardTile from './CardTile.vue'

const props = defineProps<{
  setName: string
  cards: Card[]
  isArt?: boolean
}>()

const emit = defineEmits<{
  removeCard: [id: string]
}>()

const totalValue = computed(() => {
  return props.cards.reduce((sum, card) => {
    if (card.isArtCollection) return sum + (card.artValue ?? 0)
    return sum + card.marketPriceSgd
  }, 0)
})
</script>

<template>
  <div class="set-group">
    <div class="set-header" :class="{ 'set-header-art': isArt }">
      <div class="set-header-left">
        <span class="set-name">{{ setName }}</span>
        <span class="set-count-badge" :class="{ 'badge-art': isArt }">
          {{ cards.length }}
        </span>
      </div>
      <span class="set-value mono" :class="isArt ? 'value-gold' : 'value-green'">
        {{ formatSgd(totalValue) }}
      </span>
    </div>

    <div class="card-grid">
      <CardTile
        v-for="card in cards"
        :key="card.id"
        :card="card"
        @remove="emit('removeCard', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.set-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.set-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1.5px solid var(--border);
}

.set-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.set-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.set-header-art .set-name {
  color: var(--gold);
}

.set-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  border-radius: 20px;
  background: var(--accent-light);
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
}

.badge-art {
  background: var(--gold-light);
  color: var(--gold);
}

.set-value {
  font-size: 14px;
  font-weight: 500;
}

.value-green {
  color: var(--accent);
}

.value-gold {
  color: var(--gold);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

@media (max-width: 480px) {
  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
}
</style>
