<script setup lang="ts">
import type { Card } from '@/types/card'
import { formatSgd } from '@/services/currencyService'

defineProps<{
  card: Card
}>()

const emit = defineEmits<{
  remove: [id: string]
}>()
</script>

<template>
  <div class="card-tile">
    <!-- Delete button on hover -->
    <button
      class="delete-btn"
      :aria-label="`Remove ${card.name}`"
      @click.stop="emit('remove', card.id)"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>

    <!-- Art badge -->
    <div v-if="card.isArtCollection" class="art-badge">Art</div>

    <!-- Card image -->
    <div class="card-image-wrap">
      <img
        v-if="card.imageUrl"
        :src="card.imageUrl"
        :alt="card.name"
        class="card-image"
        loading="lazy"
      />
      <div v-else class="card-placeholder">
        <span>{{ card.name }}</span>
      </div>
    </div>

    <!-- Card info -->
    <div class="card-info">
      <span class="card-name">{{ card.name }}</span>
      <span class="card-meta text-muted">
        #{{ card.number }}<span v-if="card.rarity"> · {{ card.rarity }}</span>
      </span>
      <span
        class="card-price mono"
        :class="card.isArtCollection ? 'price-gold' : 'price-green'"
      >
        {{ card.isArtCollection ? formatSgd(card.artValue ?? 0) : formatSgd(card.marketPriceSgd) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.card-tile {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: default;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.card-tile:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-tile:hover .delete-btn {
  opacity: 1;
}

/* Delete button */
.delete-btn {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  z-index: 2;
  transition: opacity 0.15s ease, background 0.15s ease, color 0.15s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

.delete-btn:hover {
  background: #fff;
  color: var(--negative);
}

/* Art badge */
.art-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 2;
  background: var(--gold);
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 6px;
}

/* Image */
.card-image-wrap {
  width: 100%;
  aspect-ratio: 2.5 / 3.5;
  overflow: hidden;
  background: var(--bg);
  flex-shrink: 0;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.2s ease;
}

.card-tile:hover .card-image {
  transform: scale(1.02);
}

.card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  text-align: center;
  background: var(--border-light);
}

.card-placeholder span {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}

/* Info section */
.card-info {
  padding: 10px 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.card-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-price {
  font-size: 12px;
  font-weight: 500;
  margin-top: 2px;
}

.price-green {
  color: var(--accent);
}

.price-gold {
  color: var(--gold);
}
</style>
