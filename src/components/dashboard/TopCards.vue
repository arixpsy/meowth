<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useCollectionStore } from '@/stores/collectionStore'
import { formatSgd } from '@/services/currencyService'

const collection = useCollectionStore()

function cardValue(card: { isArtCollection: boolean; artValue: number | null; marketPriceSgd: number }): number {
  return card.isArtCollection ? (card.artValue ?? 0) : card.marketPriceSgd
}

const topFour = collection.topCards.slice(0, 4)
</script>

<template>
  <div class="top-cards-card">
    <div class="card-header">
      <h2 class="card-title">Top Cards</h2>
      <RouterLink to="/collection" class="view-link">Collection →</RouterLink>
    </div>

    <div class="cards-list" v-if="topFour.length > 0">
      <div
        v-for="(card, index) in topFour"
        :key="card.id"
        class="card-row"
      >
        <div class="rank">#{{ index + 1 }}</div>
        <div class="card-info">
          <p class="card-name">{{ card.name }}</p>
          <p class="card-meta" v-if="!card.isArtCollection">
            {{ card.setName }} · {{ card.number }}
          </p>
          <p class="card-meta" v-else>Art Collection</p>
        </div>
        <div class="card-value-wrap">
          <span
            :class="['mono', 'card-value', card.isArtCollection ? 'value-gold' : 'value-green']"
          >{{ formatSgd(cardValue(card)) }}</span>
          <span v-if="card.isArtCollection" class="art-badge">Art</span>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <p class="empty-text">No cards in collection yet.</p>
    </div>
  </div>
</template>

<style scoped>
.top-cards-card {
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

.cards-list {
  display: flex;
  flex-direction: column;
}

.card-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 20px;
  border-bottom: 1px solid var(--border-light);
  transition: background 0.12s ease;
}

.card-row:last-child {
  border-bottom: none;
}

.card-row:hover {
  background: var(--bg);
}

.rank {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  width: 22px;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}

.card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
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

.card-value-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.card-value {
  font-size: 13px;
  font-weight: 600;
}

.value-green {
  color: var(--accent);
}

.value-gold {
  color: var(--gold);
}

.art-badge {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--gold);
  background: var(--gold-light);
  padding: 2px 6px;
  border-radius: 4px;
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
