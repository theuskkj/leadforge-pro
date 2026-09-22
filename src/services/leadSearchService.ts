import { buildMockBusinesses } from '../data/mockBusinesses'
import { computePriority, uid } from '../lib/utils'
import type { LeadSearchResult, SearchParams, WorkspaceSettings } from '../types'

function normalizeResult(item: Record<string, unknown>, niche: string, fallbackCity: string): LeadSearchResult {
  const name = String(item.name ?? item.company ?? 'Empresa local')
  const address = String(item.address ?? item.location ?? `${fallbackCity}`)
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
    phone,
    website,
    rating,
    reviewCount,
    hasWebsite,
    priority: computePriority({ hasWebsite, rating, reviewCount, hasPhone: Boolean(phone) }),
  }
}

function buildMock(params: SearchParams) {
  return buildMockBusinesses(params.niche, params.location, params.limit).map((item) =>
    normalizeResult(item as unknown as Record<string, unknown>, params.niche, params.location),
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

function getEndpoint(settings: WorkspaceSettings) {
  const fromSettings = settings.endpointUrl.trim()
  if (fromSettings) return fromSettings
  const fromEnv = (import.meta.env.VITE_LEAD_SEARCH_ENDPOINT as string | undefined)?.trim()
  return fromEnv || ''
}

export async function searchLeads(
  params: SearchParams,
  settings: Pick<WorkspaceSettings, 'searchProvider' | 'endpointUrl'>,
) {
  if (settings.searchProvider === 'mock') {
    return { results: applyFilters(buildMock(params), params), isDemo: true }
  }

  const endpoint = getEndpoint(settings as WorkspaceSettings)
  if (!endpoint) {
    return { results: applyFilters(buildMock(params), params), isDemo: true }
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        country: params.country,
        location: params.location,
        niche: params.niche,
        limit: params.limit,
      }),
    })
    if (!response.ok) throw new Error('Falha no endpoint')

    const payload = (await response.json()) as { data?: Record<string, unknown>[] }
    const list = (payload.data ?? []).map((item) => normalizeResult(item, params.niche, params.location))
    return { results: applyFilters(list, params), isDemo: false }
  } catch {
    return { results: applyFilters(buildMock(params), params), isDemo: true }
  }
}
