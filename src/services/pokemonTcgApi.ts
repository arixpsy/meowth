export interface PokemonTcgCard {
  id: string
  name: string
  number: string
  rarity?: string
  set: { id: string; name: string }
  images: { small: string; large: string }
  tcgplayer?: { prices?: Record<string, { market?: number }> }
}

export interface PokemonTcgSet {
  id: string
  name: string
  releaseDate: string
}

const BASE_URL = 'https://api.pokemontcg.io/v2'

export async function searchCards(query: string): Promise<PokemonTcgCard[]> {
  try {
    const url = `${BASE_URL}/cards?q=name:"${query}"&pageSize=20&select=id,name,set,number,rarity,images,tcgplayer`
    const response = await fetch(url)
    if (!response.ok) {
      return []
    }
    const data = await response.json()
    return data.data as PokemonTcgCard[]
  } catch {
    return []
  }
}

export async function getCard(id: string): Promise<PokemonTcgCard> {
  const url = `${BASE_URL}/cards/${id}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch card ${id}: ${response.status} ${response.statusText}`)
  }
  const data = await response.json()
  return data.data as PokemonTcgCard
}

export async function getSets(): Promise<PokemonTcgSet[]> {
  try {
    const url = `${BASE_URL}/sets?select=id,name,releaseDate&orderBy=-releaseDate`
    const response = await fetch(url)
    if (!response.ok) {
      return []
    }
    const data = await response.json()
    return data.data as PokemonTcgSet[]
  } catch {
    return []
  }
}
