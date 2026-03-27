import TCGdex, { Query } from '@tcgdex/sdk'
import type { CardResumeModel } from '@tcgdex/sdk'

const tcgdex = new TCGdex('en')

// The SDK doesn't type the pricing field, but the API returns it
interface TcgPlayerVariant {
  productId?: number
  lowPrice?: number
  midPrice?: number
  highPrice?: number
  marketPrice?: number
  directLowPrice?: number
}

interface TcgPlayerPricing {
  updated: string
  unit: string
  normal?: TcgPlayerVariant
  holofoil?: TcgPlayerVariant
  'reverse-holofoil'?: TcgPlayerVariant
  '1st-edition'?: TcgPlayerVariant
}

interface CardPricing {
  tcgplayer?: TcgPlayerPricing
}

export interface PokemonTcgCardBrief {
  id: string
  name: string
  localId: string
  image?: string
}

export interface PokemonTcgCard {
  id: string
  name: string
  localId: string
  rarity?: string
  set: { id: string; name: string }
  image?: string
  pricing?: CardPricing
}

export interface PokemonTcgSet {
  id: string
  name: string
  releaseDate: string
}

export async function searchCards(query: string): Promise<PokemonTcgCardBrief[]> {
  try {
    const results = await tcgdex.card.list(
      new Query().contains('name', query)
    )
    if (!results) return []
    return results.map((card: CardResumeModel) => ({
      id: card.id,
      name: card.name,
      localId: card.localId,
      image: card.image ?? undefined,
    }))
  } catch {
    return []
  }
}

export async function getCard(id: string): Promise<PokemonTcgCard> {
  const card = await tcgdex.card.get(id)
  if (!card) {
    throw new Error(`Card not found: ${id}`)
  }

  // Pricing exists on the API response but isn't typed in the SDK
  const pricing = (card as unknown as { pricing?: CardPricing }).pricing

  return {
    id: card.id,
    name: card.name,
    localId: card.localId,
    rarity: card.rarity ?? undefined,
    set: { id: card.set.id, name: card.set.name },
    image: card.image ?? undefined,
    pricing,
  }
}

export async function getSets(): Promise<PokemonTcgSet[]> {
  try {
    const results = await tcgdex.set.list()
    if (!results) return []
    // SetResume doesn't include releaseDate, fetch full set for each would be expensive
    // Return with empty releaseDate - caller can fetch full set if needed
    return results.map((set) => ({
      id: set.id,
      name: set.name,
      releaseDate: '',
    }))
  } catch {
    return []
  }
}
