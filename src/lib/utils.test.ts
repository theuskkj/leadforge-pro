import { describe, expect, it } from 'vitest'
import { computePriority, formatCurrency, mapsUrl } from './utils'

describe('utils centrais', () => {
  it('deve calcular prioridade mais alta para negócio sem site e com telefone', () => {
    const high = computePriority({ hasWebsite: false, rating: 4.8, reviewCount: 300, hasPhone: true })
    const low = computePriority({ hasWebsite: true, rating: 3.8, reviewCount: 10, hasPhone: false })
    expect(high).toBeGreaterThan(low)
    expect(high).toBeLessThanOrEqual(100)
  })

  it('deve gerar URL válida do Google Maps', () => {
    const url = mapsUrl('Clínica Vitta', 'Rua Vergueiro, 900 - São Paulo', 'ChIJ123')
    expect(url).toContain('https://www.google.com/maps/search/?api=1&query=')
    expect(url).toContain('query_place_id=ChIJ123')
    expect(url).toContain('Cl%C3%ADnica%20Vitta')
  })

  it('deve formatar moeda em pt-BR', () => {
    expect(formatCurrency(1234.5)).toContain('R$')
  })
})
