import { describe, expect, it } from 'vitest'
import { buildWebsitePrompt, type PromptInput } from './promptBuilder'

const input: PromptInput = {
  companyName: 'Solar Norte',
  niche: 'energia solar',
  city: 'Natal - RN',
  description: 'Instalação e manutenção de sistemas fotovoltaicos.',
  targetAudience: 'Residências e pequenos negócios',
  services: 'Projeto, instalação e manutenção',
  differentiators: 'Atendimento consultivo',
  siteGoal: 'Gerar pedidos de orçamento',
  projectType: 'landing',
  tone: 'premium',
  visualStyle: 'Premium claro com detalhes tecnológicos',
  colors: '#0b1220, #f5b942',
  cta: 'Pedir orçamento',
  trustSignals: 'Avaliação pública quando verificada',
  seoKeywords: 'energia solar natal, painel solar natal',
  imageDirection: 'Telhados reais e equipe técnica',
  integrations: 'WhatsApp e formulário',
  technicalRequirements: 'Mobile-first e Lighthouse alto',
  implementationTarget: 'React + TypeScript + Tailwind',
  verifiedAddress: 'Natal - RN',
  verifiedPhone: '(84) 99999-9999',
  verifiedRating: 4.8,
  verifiedReviewCount: 120,
}

describe('buildWebsitePrompt', () => {
  it('gera um brief específico com contexto, conversão, SEO e implementação', () => {
    const prompt = buildWebsitePrompt(input)

    expect(prompt).toContain('Solar Norte')
    expect(prompt).toContain('energia solar')
    expect(prompt).toContain('Natal - RN')
    expect(prompt).toContain('Pedir orçamento')
    expect(prompt).toContain('SEO LOCAL')
    expect(prompt).toContain('React + TypeScript + Tailwind')
    expect(prompt).toContain('4.8/5 com 120 avaliações')
    expect(prompt).toContain('Não invente avaliações')
  })

  it('inclui regras para evitar conteúdo fictício', () => {
    const prompt = buildWebsitePrompt({ ...input, trustSignals: '', verifiedRating: undefined, verifiedReviewCount: undefined })
    expect(prompt).toContain('Não invente avaliações')
    expect(prompt).toContain('não criar depoimentos')
  })
})
