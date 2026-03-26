export interface Card {
  id: string
  pokemonTcgId: string
  name: string
  setName: string
  setId: string
  number: string
  rarity: string
  imageUrl: string
  marketPriceUsd: number
  marketPriceSgd: number
  isArtCollection: boolean
  artValue: number | null // SGD, only when isArtCollection is true
  dateAdded: string // ISO date string YYYY-MM-DD
}
