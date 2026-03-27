<script setup lang="ts">
import { ref, watch } from 'vue'
import SlidePanel from '@/components/shared/SlidePanel.vue'
import { searchCards, getCard } from '@/services/pokemonTcgApi'
import type { PokemonTcgCardBrief, PokemonTcgCard } from '@/services/pokemonTcgApi'
import { convertUsdToSgd, formatSgd } from '@/services/currencyService'
import { useCollectionStore } from '@/stores/collectionStore'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const store = useCollectionStore()

const query = ref('')
const isLoading = ref(false)
const isLoadingCard = ref(false)
const results = ref<PokemonTcgCardBrief[]>([])
const selectedCard = ref<PokemonTcgCard | null>(null)
const isArtCollection = ref(false)
const artValueInput = ref('')
const showSuccess = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function extractMarketPrice(tcgCard: PokemonTcgCard): number {
  const pricing = tcgCard.pricing?.tcgplayer
  if (!pricing) return 0
  const variants = [pricing.normal, pricing.holofoil, pricing['reverse-holofoil'], pricing['1st-edition']]
  for (const variant of variants) {
    if (variant?.marketPrice != null) return variant.marketPrice
  }
  return 0
}

function onQueryInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  selectedCard.value = null
  if (!query.value.trim()) {
    results.value = []
    return
  }
  debounceTimer = setTimeout(async () => {
    isLoading.value = true
    results.value = await searchCards(query.value.trim())
    isLoading.value = false
  }, 300)
}

async function selectCard(card: PokemonTcgCardBrief) {
  isLoadingCard.value = true
  try {
    const fullCard = await getCard(card.id)
    selectedCard.value = fullCard
  } catch {
    selectedCard.value = null
  }
  isArtCollection.value = false
  artValueInput.value = ''
  isLoadingCard.value = false
}

function addCard() {
  if (!selectedCard.value) return

  const tcgCard = selectedCard.value
  const marketUsd = extractMarketPrice(tcgCard)
  const marketSgd = convertUsdToSgd(marketUsd)

  const today = new Date()
  const dateAdded = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const artVal = isArtCollection.value ? (parseFloat(artValueInput.value) || 0) : null

  store.addCard({
    pokemonTcgId: tcgCard.id,
    name: tcgCard.name,
    setName: tcgCard.set.name,
    setId: tcgCard.set.id,
    number: tcgCard.localId,
    rarity: tcgCard.rarity ?? '',
    imageUrl: tcgCard.image ? `${tcgCard.image}/low.webp` : '',
    marketPriceUsd: marketUsd,
    marketPriceSgd: marketSgd,
    isArtCollection: isArtCollection.value,
    artValue: artVal,
    dateAdded,
  })

  showSuccess.value = true
  selectedCard.value = null
  query.value = ''
  results.value = []
  isArtCollection.value = false
  artValueInput.value = ''

  setTimeout(() => {
    showSuccess.value = false
  }, 2000)
}

watch(
  () => false,
  () => {},
)
</script>

<template>
  <SlidePanel :open="open" title="Add Card" @close="emit('close')">
    <div class="add-card-panel">
      <!-- Success state -->
      <Transition name="success-fade">
        <div v-if="showSuccess" class="success-banner">
          Card added to collection!
        </div>
      </Transition>

      <!-- Search input -->
      <div class="search-field">
        <label class="field-label">Search Cards</label>
        <div class="search-input-wrap">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            v-model="query"
            type="text"
            class="search-input"
            placeholder="e.g. Charizard, Pikachu ex..."
            autocomplete="off"
            @input="onQueryInput"
          />
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner" />
        <span>Searching...</span>
      </div>

      <!-- Search results -->
      <div v-else-if="results.length > 0 && !selectedCard && !isLoadingCard" class="results-list">
        <button
          v-for="result in results"
          :key="result.id"
          class="result-item"
          @click="selectCard(result)"
        >
          <img
            v-if="result.image"
            :src="`${result.image}/low.webp`"
            :alt="result.name"
            class="result-thumb"
          />
          <div v-else class="result-thumb-placeholder" />
          <div class="result-info">
            <span class="result-name">{{ result.name }}</span>
            <span class="result-meta">#{{ result.localId }}</span>
          </div>
        </button>
      </div>

      <!-- Loading card details -->
      <div v-else-if="isLoadingCard" class="loading-state">
        <div class="spinner" />
        <span>Loading card details...</span>
      </div>

      <!-- No results -->
      <div v-else-if="query.trim() && !isLoading && results.length === 0" class="empty-state">
        No cards found for "{{ query }}"
      </div>

      <!-- Selected card details -->
      <div v-if="selectedCard" class="selected-card">
        <div class="selected-header">
          <button class="back-btn" @click="selectedCard = null; results = []">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to results
          </button>
        </div>

        <div class="selected-card-preview">
          <img
            v-if="selectedCard.image"
            :src="`${selectedCard.image}/low.webp`"
            :alt="selectedCard.name"
            class="selected-card-image"
          />
          <div v-else class="selected-card-placeholder" />
          <div class="selected-card-details">
            <span class="selected-name">{{ selectedCard.name }}</span>
            <span class="selected-set">{{ selectedCard.set.name }}</span>
            <span class="selected-number">#{{ selectedCard.localId }}<span v-if="selectedCard.rarity"> · {{ selectedCard.rarity }}</span></span>

            <div class="price-info">
              <div class="price-row">
                <span class="price-label">Market (USD)</span>
                <span class="price-value mono">${{ extractMarketPrice(selectedCard).toFixed(2) }}</span>
              </div>
              <div class="price-row">
                <span class="price-label">Converted (SGD)</span>
                <span class="price-value mono value-green">{{ formatSgd(convertUsdToSgd(extractMarketPrice(selectedCard))) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Art collection toggle -->
        <div class="toggle-field">
          <label class="toggle-label">
            <span class="toggle-text">
              <span class="toggle-title">Mark as Art Collection</span>
              <span class="toggle-desc">Set a custom SGD value for this piece</span>
            </span>
            <button
              type="button"
              class="toggle-btn"
              :class="{ active: isArtCollection }"
              @click="isArtCollection = !isArtCollection"
              :aria-pressed="isArtCollection"
            >
              <span class="toggle-thumb" />
            </button>
          </label>
        </div>

        <!-- Art value input -->
        <Transition name="slide-down">
          <div v-if="isArtCollection" class="art-value-field">
            <label class="field-label">Art Value (SGD)</label>
            <div class="input-prefix-wrap">
              <span class="input-prefix">$</span>
              <input
                v-model="artValueInput"
                type="number"
                min="0"
                step="0.01"
                class="field-input prefix-input"
                placeholder="0.00"
              />
            </div>
          </div>
        </Transition>

        <!-- Add button -->
        <button class="add-btn" @click="addCard">
          Add to Collection
        </button>
      </div>
    </div>
  </SlidePanel>
</template>

<style scoped>
.add-card-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Success banner */
.success-banner {
  padding: 12px 16px;
  background: var(--accent-light);
  color: var(--accent);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.success-fade-enter-active,
.success-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.success-fade-enter-from,
.success-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Search */
.search-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-muted);
  pointer-events: none;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  padding: 10px 14px 10px 38px;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
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

/* Loading */
.loading-state {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 0;
  color: var(--text-secondary);
  font-size: 13px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Results list */
.results-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 420px;
  overflow-y: auto;
  margin: 0 -4px;
  padding: 0 4px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: var(--bg);
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease, border-color 0.15s ease;
  width: 100%;
}

.result-item:hover {
  background: var(--bg-card);
  border-color: var(--border);
}

.result-thumb {
  width: 42px;
  height: 58px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.result-thumb-placeholder {
  width: 42px;
  height: 58px;
  border-radius: 4px;
  background: var(--border-light);
  flex-shrink: 0;
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.result-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-meta {
  font-size: 11px;
  color: var(--text-muted);
}

.result-price {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

/* Empty state */
.empty-state {
  padding: 24px 0;
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
}

/* Selected card */
.selected-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.selected-header {
  display: flex;
  align-items: center;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px 0;
  transition: color 0.15s ease;
}

.back-btn:hover {
  color: var(--text-primary);
}

.selected-card-preview {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.selected-card-image {
  width: 90px;
  flex-shrink: 0;
  border-radius: 6px;
  border: 1px solid var(--border);
}

.selected-card-placeholder {
  width: 90px;
  aspect-ratio: 2.5 / 3.5;
  border-radius: 6px;
  background: var(--border-light);
  flex-shrink: 0;
}

.selected-card-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.selected-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.selected-set {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.selected-number {
  font-size: 11px;
  color: var(--text-muted);
}

.price-info {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-label {
  font-size: 11px;
  color: var(--text-muted);
}

.price-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.value-green {
  color: var(--accent);
}

/* Toggle */
.toggle-field {
  border-top: 1px solid var(--border-light);
  padding-top: 16px;
}

.toggle-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  gap: 12px;
}

.toggle-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toggle-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.toggle-desc {
  font-size: 11px;
  color: var(--text-muted);
}

.toggle-btn {
  position: relative;
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background: var(--border);
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;
  padding: 0;
}

.toggle-btn.active {
  background: var(--gold);
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.toggle-btn.active .toggle-thumb {
  transform: translateX(18px);
}

/* Art value field */
.art-value-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.input-prefix-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-prefix {
  position: absolute;
  left: 14px;
  font-size: 14px;
  color: var(--text-secondary);
  pointer-events: none;
  user-select: none;
}

.field-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s ease;
}

.field-input:focus {
  border-color: var(--accent);
}

.field-input::placeholder {
  color: var(--text-muted);
}

.field-input[type='number']::-webkit-inner-spin-button,
.field-input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.field-input[type='number'] {
  -moz-appearance: textfield;
}

.prefix-input {
  padding-left: 28px;
}

/* Add button */
.add-btn {
  width: 100%;
  padding: 13px;
  background: var(--accent);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.add-btn:hover {
  opacity: 0.9;
}
</style>
