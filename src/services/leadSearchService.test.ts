import { afterEach, describe, expect, it, vi } from 'vitest'
import { normalizeGooglePlace, searchLeads } from './leadSearchService'
import type { SearchParams, WorkspaceSettings } from '../types'

const params: SearchParams = {
  country: 'Brasil',
  location: 'São Paulo',
  niche: 'clínicas',
  limit: 5,
  onlyNoWebsite: false,
}

const settings: WorkspaceSettings = {
  workspaceName: 'LeadForge Pro',
  currency: 'BRL',
  defaultPotentialValue: 0,
  defaultResultLimit: 20,
  compactMode: false,
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('normalizeGooglePlace', () => {
  it('normaliza Place API para LeadSearchResult real', () => {
    const result = normalizeGooglePlace({
      id: 'ChIJ123',
      displayName: { text: 'Clínica Teste' },
      formattedAddress: 'Rua A, 10 - São Paulo',
      nationalPhoneNumber: '(11) 99999-0000',
      websiteUri: 'https://clinic.example',
      rating: 4.8,
      userRatingCount: 321,
      primaryTypeDisplayName: { text: 'Clínica médica' },
      location: { latitude: -23.5, longitude: -46.6 },
    }, params)

    expect(result.name).toBe('Clínica Teste')
    expect(result.website).toBe('https://clinic.example')
    expect(result.googleMapsUrl).toContain('query_place_id=ChIJ123')
    expect(result.lat).toBe(-23.5)
    expect(result.priority).toBeGreaterThan(0)
  })
})

describe('searchLeads', () => {
  it('usa somente Google Places', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        source: 'google',
        places: [{
          id: 'p1',
          displayName: { text: 'Clínica Real' },
          formattedAddress: 'Rua Real, 123',
          rating: 4.9,
          userRatingCount: 99,
          nationalPhoneNumber: '(11) 99999-9999',
        }],
      }),
    })
    vi.stubGlobal('fetch', fetchSpy)

    const result = await searchLeads(params, settings)

    expect(fetchSpy).toHaveBeenCalledWith('/api/google-places', expect.objectContaining({ method: 'POST' }))
    expect(result.source).toBe('google')
    expect(result.results[0]?.name).toBe('Clínica Real')
  })

  it('não fabrica resultados quando a API falha', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'API não configurada' }),
    })
    vi.stubGlobal('fetch', fetchSpy)

    const result = await searchLeads(params, settings)

    expect(result.results).toEqual([])
    expect(result.error).toContain('API')
  })
})
