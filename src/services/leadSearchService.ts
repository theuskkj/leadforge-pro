import { computePriority, mapsUrl, uid } from '../lib/utils'
import type { LeadSearchResult, SearchParams, SearchResponse, WorkspaceSettings } from '../types'

type ScraperResult = {
  id?: string
  name?: string
  niche?: string
  city?: string
  address?: string
  phone?: string
  website?: string
  rating?: number
  reviewCount?: number
  googleMapsUrl?: string
  placeId?: string
  lat?: number
  lng?: number
}

type ScraperResponse = {
  source?: 'scraper'
  error?: string
  results?: ScraperResult[]
  scannedCount?: number
  matchedCount?: number
  partial?: boolean
}

export function normalizeScraperResult(item: ScraperResult, params: Pick<SearchParams, 'niche' | 'location'>): LeadSearchResult {
  const name = item.name?.trim() || 'Empresa sem nome informado'
  const address = item.address?.trim() || params.location
  const phone = item.phone?.trim()
  const website = item.website?.trim()
  const rating = Number(item.rating || 0)
  const reviewCount = Number(item.reviewCount || 0)
  const hasWebsite = Boolean(website)

  return {
    id: item.id || item.placeId || uid(),
    name,
    niche: item.niche?.trim() || params.niche,
    city: item.city?.trim() || params.location,
    address,
    rating,
    reviewCount,
    hasWebsite,
    priority: computePriority({
      hasWebsite,
      rating,
      reviewCount,
      hasPhone: Boolean(phone),
    }),
    googleMapsUrl: item.googleMapsUrl || mapsUrl(name, address, item.placeId),
    ...(phone ? { phone } : {}),
    ...(website ? { website } : {}),
    ...(typeof item.lat === 'number' ? { lat: item.lat } : {}),
    ...(typeof item.lng === 'number' ? { lng: item.lng } : {}),
  }
}

function applyFilters(results: LeadSearchResult[], params: SearchParams) {
  return results
    .filter((item) => {
      if (params.onlyNoWebsite && item.hasWebsite) return false
      if (params.minRating && item.rating < params.minRating) return false
      if (params.onlyWithPhone && !item.phone) return false
      return true
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, Math.min(20, Math.max(1, params.limit)))
}

export async function searchLeads(
  params: SearchParams,
  _settings?: WorkspaceSettings,
): Promise<SearchResponse> {
  try {
    const response = await fetch('/api/maps-scraper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        country: params.country,
        location: params.location,
        niche: params.niche,
        limit: Math.min(20, Math.max(1, params.limit)),
        minRating: params.minRating,
        onlyNoWebsite: params.onlyNoWebsite,
        onlyWithPhone: params.onlyWithPhone ?? false,
        searchRound: params.searchRound ?? 0,
      }),
    })

    const payload = (await response.json()) as ScraperResponse

    if (!response.ok) {
      return {
        results: [],
        source: 'scraper',
        error: payload.error || 'Não foi possível pesquisar no Google Maps.',
      }
    }

    const normalized = (payload.results ?? []).map((item) =>
      normalizeScraperResult(item, params),
    )

    return {
      results: applyFilters(normalized, params),
      source: 'scraper',
      scannedCount: payload.scannedCount,
      matchedCount: payload.matchedCount,
      partial: payload.partial,
    }
  } catch {
    return {
      results: [],
      source: 'scraper',
      error: 'Não foi possível conectar ao servidor de pesquisa do Google Maps.',
    }
  }
}

export async function getScraperStatus() {
  try {
    const response = await fetch('/api/maps-scraper')
    if (!response.ok) return false
    const payload = (await response.json()) as { configured?: boolean }
    return Boolean(payload.configured)
  } catch {
    return false
  }
}
