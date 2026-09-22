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

const googleSettings: WorkspaceSettings = {
  workspaceName: 'LeadForge Pro',
  currency: 'BRL',
  defaultPotentialValue: 6000,
  defaultResultLimit: 20,
  searchProvider: 'google',
  compactMode: false,
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('normalizeGooglePlace', () => {
  it('normaliza Place API para LeadSearchResult', () => {
    const result = normalizeGooglePlace({
      id: 'places/abc',
      displayName: { text: 'Clínica Teste' },
      formattedAddress: 'Rua A, 10 - São Paulo',
      nationalPhoneNumber: '(11) 99999-0000',
      websiteUri: 'https://clinic.example',
      rating: 4.8,
      userRatingCount: 321,
      primaryTypeDisplayName: { text: 'Clínica médica' },
      googleMapsLinks: { placeUri: 'https://maps.google.com/test' },
      location: { latitude: -23.5, longitude: -46.6 },
    }, params)

    expect(result.name).toBe('Clínica Teste')
    expect(result.website).toBe('https://clinic.example')
    expect(result.googleMapsUrl).toBe('https://maps.google.com/test')
    expect(result.lat).toBe(-23.5)
    expect(result.priority).toBeGreaterThan(0)
  })
})

describe('searchLeads', () => {
  it('usa mock quando provider é mock', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    const result = await searchLeads(params, { ...googleSettings, searchProvider: 'mock' })

    expect(result.isDemo).toBe(true)
    expect(result.source).toBe('mock')
    expect(result.results.length).toBeGreaterThan(0)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('usa Google Places quando provider é google', async () => {
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

    const result = await searchLeads(params, googleSettings)

    expect(fetchSpy).toHaveBeenCalledWith('/api/google-places', expect.objectContaining({ method: 'POST' }))
    expect(result.isDemo).toBe(false)
    expect(result.source).toBe('google')
    expect(result.results[0]?.name).toBe('Clínica Real')
  })

  it('faz fallback para mock quando Google Places falha', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'API não configurada' }),
    })
    vi.stubGlobal('fetch', fetchSpy)

    const result = await searchLeads(params, googleSettings)

    expect(result.isDemo).toBe(true)
    expect(result.source).toBe('mock')
    expect(result.error).toContain('API')
    expect(result.results.length).toBeGreaterThan(0)
  })
})
