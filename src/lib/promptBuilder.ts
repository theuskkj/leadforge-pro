export interface PromptInput {
  companyName: string
  niche: string
  city: string
  description: string
  targetAudience: string
  services: string
  siteGoal: string
  visualStyle: string
  colors: string
  cta: string
}

export function buildWebsitePrompt(input: PromptInput) {
  return `Crie um website profissional para a empresa ${input.companyName}, do nicho ${input.niche}, localizada em ${input.city}.

Contexto da empresa:
${input.description}

Objetivo do projeto:
${input.siteGoal}

Público-alvo:
${input.targetAudience}

Estrutura obrigatória:
1. Hero forte com proposta de valor, CTA "${input.cta}" e destaque local.
2. Sessão de serviços principais: ${input.services}.
3. Diferenciais competitivos com bullets.
4. Provas sociais (avaliações, depoimentos e credibilidade local).
5. Bloco de contato com WhatsApp em destaque, telefone e mapa.
6. SEO local com menções à cidade e bairros.

Diretrizes de design:
- Estilo visual: ${input.visualStyle}
- Paleta sugerida: ${input.colors}
- Layout responsivo (mobile-first)
- Performance e acessibilidade básica

Inclua chamadas para ação em toda a página e uma versão de copy orientada para conversão.`
}
