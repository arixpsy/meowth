import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { v4 as uuid } from 'uuid'
import type { Card } from '@/types/card'
import { storage } from '@/services/storage'

export const useCollectionStore = defineStore('collection', () => {
  const cards = ref<Card[]>(storage.getCards())

  function save() {
    storage.saveCards(cards.value)
  }

  function addCard(data: Omit<Card, 'id'>) {
    const card: Card = { id: uuid(), ...data }
    cards.value.push(card)
    save()
  }

  function updateCard(id: string, data: Partial<Card>) {
    const index = cards.value.findIndex(c => c.id === id)
    if (index !== -1) {
      cards.value[index] = { ...cards.value[index], ...data }
      save()
    }
  }

  function removeCard(id: string) {
    cards.value = cards.value.filter(c => c.id !== id)
    save()
  }

  function cardValue(card: Card): number {
    return card.isArtCollection ? (card.artValue ?? 0) : card.marketPriceSgd
  }

  const totalValue = computed(() =>
    cards.value.reduce((sum, card) => sum + cardValue(card), 0),
  )

  const artCollectionCards = computed(() =>
    cards.value.filter(c => c.isArtCollection),
  )

  const artCollectionValue = computed(() =>
    artCollectionCards.value.reduce((sum, c) => sum + (c.artValue ?? 0), 0),
  )

  const cardsBySet = computed(() => {
    const map = new Map<string, Card[]>()
    for (const card of cards.value) {
      if (card.isArtCollection) continue
      const existing = map.get(card.setName)
      if (existing) {
        existing.push(card)
      } else {
        map.set(card.setName, [card])
      }
    }
    return map
  })

  const topCards = computed(() =>
    [...cards.value]
      .sort((a, b) => cardValue(b) - cardValue(a))
      .slice(0, 5),
  )

  const valueBySet = computed(() => {
    const entries: { setName: string; value: number }[] = []

    // Regular cards grouped by set
    const setTotals = new Map<string, number>()
    for (const card of cards.value) {
      if (card.isArtCollection) continue
      setTotals.set(card.setName, (setTotals.get(card.setName) ?? 0) + card.marketPriceSgd)
    }
    for (const [setName, value] of setTotals) {
      entries.push({ setName, value })
    }

    // Art collection as a single entry
    if (artCollectionCards.value.length > 0) {
      entries.push({ setName: 'Art Collection', value: artCollectionValue.value })
    }

    return entries.sort((a, b) => b.value - a.value)
  })

  return {
    cards,
    addCard,
    updateCard,
    removeCard,
    totalValue,
    artCollectionCards,
    artCollectionValue,
    cardsBySet,
    topCards,
    valueBySet,
  }
})
