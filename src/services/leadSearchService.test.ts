import { afterEach, describe, expect, it, vi } from 'vitest'
import { normalizeScraperResult, searchLeads } from './leadSearchService'
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

describe('normalizeScraperResult', () => {
  it('normaliza um resultado real do scraper', () => {
    const result = normalizeScraperResult({
      id: 'ChIJ123',
      placeId: 'ChIJ123',
      name: 'Clínica Teste',
      address: 'Rua A, 10 - São Paulo',
      phone: '(11) 99999-0000',
      website: 'https://clinic.example',
      rating: 4.8,
      reviewCount: 321,
      niche: 'Clínica médica',
      googleMapsUrl: 'https://www.google.com/maps/place/test',
      lat: -23.5,
      lng: -46.6,
    }, params)

    expect(result.name).toBe('Clínica Teste')
    expect(result.website).toBe('https://clinic.example')
    expect(result.googleMapsUrl).toContain('google.com/maps')
    expect(result.lat).toBe(-23.5)
    expect(result.priority).toBeGreaterThan(0)
  })
})

describe('searchLeads', () => {
  it('cria job e retorna resultados quando o scraper completa', async () => {
    const fetchSpy = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jobId: 'job-1', status: 'pending' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jobId: 'job-1',
          status: 'completed',
          results: [{
            id: 'p1',
            name: 'Clínica Real',
            address: 'Rua Real, 123',
            rating: 4.9,
            reviewCount: 99,
            phone: '(11) 99999-9999',
          }],
        }),
      })

    vi.stubGlobal('fetch', fetchSpy)

    const result = await searchLeads(params, settings)

    expect(fetchSpy).toHaveBeenNthCalledWith(1, '/api/maps-scraper', expect.objectContaining({ method: 'POST' }))
    expect(fetchSpy).toHaveBeenNthCalledWith(2, '/api/maps-scraper?job_id=job-1')
    expect(result.source).toBe('scraper')
    expect(result.results[0]?.name).toBe('Clínica Real')
  })

  it('não cria resultados fictícios quando o scraper falha', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Scraper indisponível' }),
    })
    vi.stubGlobal('fetch', fetchSpy)

    const result = await searchLeads(params, settings)

    expect(result.results).toEqual([])
    expect(result.error).toContain('Scraper')
  })
})
