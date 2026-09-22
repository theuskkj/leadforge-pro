const namesByNiche: Record<string, string[]> = {
  concessionárias: ['NovaDrive Veículos', 'Veloz Prime Autos', 'Capital Motors'],
  arquitetos: ['Studio Linha Arquitetura', 'Traço Urbano Arquitetura', 'Horizonte Projetos'],
  clínicas: ['Clínica Vitta', 'Clínica Harmonia', 'Centro Médico Nova Vida'],
  restaurantes: ['Cantina Bella Serra', 'Bistrô Alma Paulista', 'Sabor da Vila'],
  academias: ['Atlas Fitness', 'Energia Fit Club', 'Pico Performance'],
  imobiliárias: ['Horizonte Imóveis', 'Portal Lar Negócios', 'Prime Chaves Imobiliária'],
  salões: ['Studio Brilho Salão', 'Essenza Beauty', 'Espaço Aura'],
  oficinas: ['AutoCare Oficina', 'Torque Centro Automotivo', 'Mecânica Ponto Certo'],
  contabilidades: ['Sigma Contábil', 'Núcleo Fiscal Assessoria', 'Conecta Contabilidade'],
  advogados: ['Moraes & Lima Advocacia', 'Fernandes Jurídico', 'Nexo Consultoria Legal'],
}

const neighborhoods = ['Vila Mariana', 'Moema', 'Pinheiros', 'Tatuapé', 'Lapa', 'Santo Amaro', 'Bela Vista']

const streets = ['Rua das Palmeiras', 'Av. Paulista', 'Rua Augusta', 'Rua dos Pinheiros', 'Av. Brasil', 'Rua Oscar Freire']

export function buildMockBusinesses(niche: string, location: string, limit: number) {
  const pool = namesByNiche[niche] ?? Object.values(namesByNiche).flat()

  return Array.from({ length: limit }).map((_, index) => {
    const name = `${pool[index % pool.length]} ${index > 2 ? `Unidade ${index + 1}` : ''}`.trim()
    const hasWebsite = index % 3 !== 0
    const hasPhone = index % 4 !== 0
    const rating = Number((3.6 + ((index * 7) % 14) / 10).toFixed(1))
    const reviewCount = 10 + ((index * 23) % 650)
    const city = location || `São Paulo - ${neighborhoods[index % neighborhoods.length]}`
    return {
      id: `mock-${index}-${name.toLowerCase().replaceAll(' ', '-')}`,
      name,
      niche,
      city,
      address: `${streets[index % streets.length]}, ${100 + index} - ${neighborhoods[index % neighborhoods.length]}, ${city}`,
      phone: hasPhone ? `(11) 9${String(1000 + index).padStart(4, '0')}-${String(2000 + index).padStart(4, '0')}` : undefined,
      website: hasWebsite ? `https://www.${name.toLowerCase().replaceAll(/[^a-z0-9]/g, '')}.com.br` : undefined,
      rating,
      reviewCount,
      hasWebsite,
    }
  })
}
