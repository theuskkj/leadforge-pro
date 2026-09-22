import { computePriority, mapsUrl, uid } from '../lib/utils'
import type { LeadSearchResult, SearchParams, SearchResponse, WorkspaceSettings } from '../types'

type GooglePlace = {
  id?: string
  displayName?: { text?: string }
  formattedAddress?: string
  nationalPhoneNumber?: string
  websiteUri?: string
  rating?: number
  userRatingCount?: number
  primaryTypeDisplayName?: { text?: string }
  googleMapsLinks?: { placeUri?: string }
  location?: { latitude?: number; longitude?: number }
}

type GoogleApiResponse = {
  places?: GooglePlace[]
  source?: 'google'
  error?: string
}

export function normalizeGooglePlace(place: GooglePlace, params: Pick<SearchParams, 'niche' | 'location'>): LeadSearchResult {
  const name = place.displayName?.text?.trim() || 'Empresa sem nome informado'
  const address = place.formattedAddress?.trim() || params.location
  const rating = Number(place.rating ?? 0)
  const reviewCount = Number(place.userRatingCount ?? 0)
  const phone = place.nationalPhoneNumber?.trim()
  const website = place.websiteUri?.trim()
  const hasWebsite = Boolean(website)
  const niche = place.primaryTypeDisplayName?.text?.trim() || params.niche
  const id = place.id || uid()

  return {
    id,
    name,
    niche,
    city: params.location,
    address,
    rating,
    reviewCount,
    hasWebsite,
    priority: computePriority({ hasWebsite, rating, reviewCount, hasPhone: Boolean(phone) }),
    googleMapsUrl: mapsUrl(name, address, place.id),
    ...(phone ? { phone } : {}),
    ...(website ? { website } : {}),
    ...(typeof place.location?.latitude === 'number' ? { lat: place.location.latitude } : {}),
    ...(typeof place.location?.longitude === 'number' ? { lng: place.location.longitude } : {}),
  }
}

function applyFilters(results: LeadSearchResult[], params: SearchParams) {
  return results.filter((item) => {
    if (params.onlyNoWebsite && item.hasWebsite) return false
    if (params.minRating && item.rating < params.minRating) return false
    if (params.onlyWithPhone && !item.phone) return false
    return true
  })
}

export async function searchLeads(params: SearchParams, _settings?: WorkspaceSettings): Promise<SearchResponse> {
  try {
    const response = await fetch('/api/google-places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        country: params.country,
        location: params.location,
        niche: params.niche,
        limit: Math.min(20, Math.max(1, params.limit)),
        minRating: params.minRating,
      }),
    })

    const payload = (await response.json()) as GoogleApiResponse

    if (!response.ok) {
      return {
        results: [],
        source: 'google',
        error: payload.error || 'Não foi possível consultar o Google Places.',
      }
    }

    return {
      results: applyFilters((payload.places ?? []).map((place) => normalizeGooglePlace(place, params)), params),
      source: 'google',
    }
  } catch {
    return {
      results: [],
      source: 'google',
      error: 'Não foi possível conectar ao Google Places.',
    }
  }
}

export async function getGooglePlacesStatus() {
  try {
    const response = await fetch('/api/google-places')
    if (!response.ok) return false
    const payload = (await response.json()) as { configured?: boolean }
    return Boolean(payload.configured)
  } catch {
    return false
  }
}
