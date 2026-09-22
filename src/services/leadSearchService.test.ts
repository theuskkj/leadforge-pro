import { afterEach, describe, expect, it, vi } from 'vitest'
import { searchLeads } from './leadSearchService'
import type { SearchParams } from '../types'

const params: SearchParams = {
  country: 'Brasil',
  location: 'São Paulo',
  niche: 'clínicas',
  limit: 5,
  onlyNoWebsite: false,
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('searchLeads', () => {
  it('usa mock quando provider é mock', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    const result = await searchLeads(params, { searchProvider: 'mock', endpointUrl: 'https://api.example.com' })

    expect(result.isDemo).toBe(true)
    expect(result.results.length).toBeGreaterThan(0)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('usa endpoint configurado quando provider é endpoint', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            id: 'x1',
            name: 'Clínica Teste',
            niche: 'clínicas',
            city: 'São Paulo',
            address: 'Rua A, 10',
            phone: '(11) 99999-0000',
            rating: 4.8,
            reviewCount: 120,
          },
        ],
      }),
    })
    vi.stubGlobal('fetch', fetchSpy)

    const result = await searchLeads(params, { searchProvider: 'endpoint', endpointUrl: 'https://api.example.com/leads' })

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.example.com/leads',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(result.isDemo).toBe(false)
    expect(result.results[0]?.name).toBe('Clínica Teste')
  })

  it('faz fallback para mock quando endpoint falha', async () => {
    const fetchSpy = vi.fn().mockRejectedValue(new Error('offline'))
    vi.stubGlobal('fetch', fetchSpy)

    const result = await searchLeads(params, { searchProvider: 'endpoint', endpointUrl: 'https://api.example.com/leads' })

    expect(result.isDemo).toBe(true)
    expect(result.results.length).toBeGreaterThan(0)
  })
})
