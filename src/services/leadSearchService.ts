import { buildMockBusinesses } from '../data/mockBusinesses'
import { computePriority, uid } from '../lib/utils'
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

function normalizeLegacyResult(item: Record<string, unknown>, niche: string, fallbackCity: string): LeadSearchResult {
  const name = String(item.name ?? item.company ?? 'Empresa local')
  const address = String(item.address ?? item.location ?? fallbackCity)
  const city = String(item.city ?? fallbackCity)
  const rating = Number(item.rating ?? 4)
  const reviewCount = Number(item.reviewCount ?? item.reviews ?? 0)
  const website = item.website ? String(item.website) : undefined
  const phone = item.phone ? String(item.phone) : undefined
  const hasWebsite = Boolean(website)

  return {
    id: String(item.id ?? uid()),
    name,
    niche: String(item.niche ?? niche),
    city,
    address,
    rating,
    reviewCount,
    hasWebsite,
    priority: computePriority({ hasWebsite, rating, reviewCount, hasPhone: Boolean(phone) }),
    ...(phone ? { phone } : {}),
    ...(website ? { website } : {}),
    ...(item.googleMapsUrl ? { googleMapsUrl: String(item.googleMapsUrl) } : {}),
    ...(typeof item.lat === 'number' ? { lat: item.lat } : {}),
    ...(typeof item.lng === 'number' ? { lng: item.lng } : {}),
  }
}

export function normalizeGooglePlace(place: GooglePlace, params: Pick<SearchParams, 'niche' | 'location'>): LeadSearchResult {
  const name = place.displayName?.text?.trim() || 'Empresa local'
  const address = place.formattedAddress?.trim() || params.location
  const rating = Number(place.rating ?? 0)
  const reviewCount = Number(place.userRatingCount ?? 0)
  const phone = place.nationalPhoneNumber?.trim()
  const website = place.websiteUri?.trim()
  const hasWebsite = Boolean(website)
  const niche = place.primaryTypeDisplayName?.text?.trim() || params.niche

  return {
    id: place.id || uid(),
    name,
    niche,
    city: params.location,
    address,
    rating,
    reviewCount,
    hasWebsite,
    priority: computePriority({ hasWebsite, rating, reviewCount, hasPhone: Boolean(phone) }),
    ...(phone ? { phone } : {}),
    ...(website ? { website } : {}),
    ...(place.googleMapsLinks?.placeUri ? { googleMapsUrl: place.googleMapsLinks.placeUri } : {}),
    ...(typeof place.location?.latitude === 'number' ? { lat: place.location.latitude } : {}),
    ...(typeof place.location?.longitude === 'number' ? { lng: place.location.longitude } : {}),
  }
}

function buildMock(params: SearchParams) {
  return buildMockBusinesses(params.niche, params.location, params.limit).map((item) =>
    normalizeLegacyResult(item as unknown as Record<string, unknown>, params.niche, params.location),
  )
}

function applyFilters(results: LeadSearchResult[], params: SearchParams) {
  return results.filter((item) => {
    if (params.onlyNoWebsite && item.hasWebsite) return false
    if (params.minRating && item.rating < params.minRating) return false
    if (params.onlyWithPhone && !item.phone) return false
    return true
  })
}

function mockResponse(params: SearchParams, error?: string): SearchResponse {
  return {
    results: applyFilters(buildMock(params), params),
    isDemo: true,
    source: 'mock',
    ...(error ? { error } : {}),
  }
}

export async function searchLeads(params: SearchParams, settings?: WorkspaceSettings): Promise<SearchResponse> {
  if (settings?.searchProvider === 'mock') return mockResponse(params)

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
        onlyWithoutWebsite: params.onlyNoWebsite,
        onlyWithPhone: params.onlyWithPhone,
      }),
    })

    const payload = (await response.json()) as GoogleApiResponse

    if (!response.ok) {
      return mockResponse(params, payload.error || 'Google Places indisponível.')
    }

    const normalized = (payload.places ?? []).map((place) => normalizeGooglePlace(place, params))
    return {
      results: applyFilters(normalized, params),
      isDemo: false,
      source: 'google',
    }
  } catch {
    return mockResponse(params, 'Não foi possível acessar o Google Places.')
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
