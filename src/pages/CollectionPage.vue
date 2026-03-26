<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCollectionStore } from '@/stores/collectionStore'
import type { Card } from '@/types/card'
import FilterChips from '@/components/shared/FilterChips.vue'
import CollectionStats from '@/components/collection/CollectionStats.vue'
import SetGroup from '@/components/collection/SetGroup.vue'
import AddCardPanel from '@/components/collection/AddCardPanel.vue'

const store = useCollectionStore()

const panelOpen = ref(false)
const searchQuery = ref('')
const activeFilter = ref('all')

const filterOptions = [
  { key: 'all', label: 'All Cards' },
  { key: 'art', label: 'Art Collection' },
]

const setCount = computed(() => store.cardsBySet.size)

// Filtered cardsBySet based on search query (filters by card name within each set)
const filteredCardsBySet = computed(() => {
  if (!searchQuery.value.trim()) return store.cardsBySet

  const q = searchQuery.value.toLowerCase()
  const filtered = new Map<string, Card[]>()

  for (const [setName, cards] of store.cardsBySet) {
    const matching = cards.filter(c => c.name.toLowerCase().includes(q))
    if (matching.length > 0) filtered.set(setName, matching)
  }

  return filtered
})

// Filtered art collection cards based on search query
const filteredArtCards = computed(() => {
  if (!searchQuery.value.trim()) return store.artCollectionCards

  const q = searchQuery.value.toLowerCase()
  return store.artCollectionCards.filter(c => c.name.toLowerCase().includes(q))
})

function removeCard(id: string) {
  store.removeCard(id)
}
</script>

<template>
  <div class="collection-page">
    <!-- Page header -->
    <div class="page-header">
      <h1 class="page-title heading-serif">Collection</h1>
      <button class="add-btn" @click="panelOpen = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Card
      </button>
    </div>

    <!-- Stats bar -->
    <CollectionStats
      :total-cards="store.cards.length"
      :collection-value="store.totalValue"
      :art-value="store.artCollectionValue"
      :set-count="setCount"
    />

    <!-- Search + filter row -->
    <div class="controls-row">
      <div class="search-wrap">
        <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search your collection..."
          autocomplete="off"
        />
      </div>
      <FilterChips
        :options="filterOptions"
        :model-value="activeFilter"
        @update:model-value="activeFilter = $event"
      />
    </div>

    <!-- Empty state -->
    <div
      v-if="store.cards.length === 0"
      class="empty-state"
    >
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      </div>
      <p class="empty-title">No cards yet</p>
      <p class="empty-desc">Add your first card to start tracking your collection.</p>
      <button class="empty-add-btn" @click="panelOpen = true">Add Card</button>
    </div>

    <!-- Collection content -->
    <div v-else class="collection-content">
      <!-- Regular sets (shown when filter is 'all') -->
      <template v-if="activeFilter === 'all'">
        <div
          v-if="filteredCardsBySet.size === 0 && filteredArtCards.length === 0"
          class="no-results"
        >
          No cards match "{{ searchQuery }}"
        </div>

        <SetGroup
          v-for="[setName, cards] in filteredCardsBySet"
          :key="setName"
          :set-name="setName"
          :cards="cards"
          @remove-card="removeCard"
        />

        <!-- Art collection section -->
        <SetGroup
          v-if="filteredArtCards.length > 0"
          set-name="Art Collection"
          :cards="filteredArtCards"
          :is-art="true"
          @remove-card="removeCard"
        />
      </template>

      <!-- Art collection only filter -->
      <template v-else-if="activeFilter === 'art'">
        <div v-if="filteredArtCards.length === 0" class="no-results">
          <template v-if="searchQuery.trim()">
            No art cards match "{{ searchQuery }}"
          </template>
          <template v-else>
            No art collection cards yet. Add a card and mark it as Art Collection.
          </template>
        </div>

        <SetGroup
          v-else
          set-name="Art Collection"
          :cards="filteredArtCards"
          :is-art="true"
          @remove-card="removeCard"
        />
      </template>
    </div>

    <!-- Add Card panel -->
    <AddCardPanel :open="panelOpen" @close="panelOpen = false" />
  </div>
</template>

<style scoped>
.collection-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-title {
  font-size: 32px;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: var(--accent);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: opacity 0.15s ease;
  flex-shrink: 0;
}

.add-btn:hover {
  opacity: 0.9;
}

/* Controls row */
.controls-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 9px 14px 9px 36px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s ease;
}

.search-input:focus {
  border-color: var(--accent);
}

.search-input::placeholder {
  color: var(--text-muted);
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  gap: 12px;
  text-align: center;
}

.empty-icon {
  color: var(--border);
  margin-bottom: 8px;
}

.empty-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.empty-desc {
  font-size: 13px;
  color: var(--text-muted);
  max-width: 280px;
  line-height: 1.5;
}

.empty-add-btn {
  margin-top: 8px;
  padding: 10px 24px;
  background: var(--accent);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.empty-add-btn:hover {
  opacity: 0.9;
}

/* No results */
.no-results {
  padding: 40px 0;
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
}

/* Collection sections */
.collection-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

@media (max-width: 768px) {
  .collection-page {
    padding: 20px 16px;
    gap: 20px;
  }

  .page-title {
    font-size: 26px;
  }

  .controls-row {
    gap: 12px;
  }

  .search-wrap {
    min-width: 0;
    width: 100%;
    flex: none;
  }
}
</style>
