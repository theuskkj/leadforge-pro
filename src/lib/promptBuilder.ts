export type ProjectType = 'landing' | 'institucional' | 'catalogo'
export type PromptTone = 'direto' | 'premium' | 'acolhedor' | 'tecnico'

export interface PromptInput {
  companyName: string
  niche: string
  city: string
  description: string
  targetAudience: string
  services: string
  differentiators: string
  siteGoal: string
  projectType: ProjectType
  tone: PromptTone
  visualStyle: string
  colors: string
  cta: string
  trustSignals: string
  seoKeywords: string
  imageDirection: string
  integrations: string
  technicalRequirements: string
  implementationTarget: string
  verifiedAddress?: string
  verifiedPhone?: string
  verifiedRating?: number
  verifiedReviewCount?: number
}

const projectTypeLabel: Record<ProjectType, string> = {
  landing: 'landing page de alta conversão',
  institucional: 'site institucional completo',
  catalogo: 'site comercial com catálogo de serviços/produtos',
}

const toneLabel: Record<PromptTone, string> = {
  direto: 'direto, comercial e objetivo',
  premium: 'premium, confiante e sofisticado',
  acolhedor: 'humano, acolhedor e acessível',
  tecnico: 'técnico, preciso e orientado à autoridade',
}

function valueOrFallback(value: string, fallback: string) {
  return value.trim() || fallback
}

function verifiedContext(input: PromptInput) {
  const lines: string[] = []
  if (input.verifiedAddress?.trim()) lines.push(`- Endereço verificado: ${input.verifiedAddress.trim()}`)
  if (input.verifiedPhone?.trim()) lines.push(`- Telefone verificado: ${input.verifiedPhone.trim()}`)
  if (typeof input.verifiedRating === 'number' && input.verifiedRating > 0) {
    const reviews = input.verifiedReviewCount ? ` com ${input.verifiedReviewCount} avaliações` : ''
    lines.push(`- Avaliação pública verificada: ${input.verifiedRating.toFixed(1)}/5${reviews}`)
  }

  return lines.length
    ? lines.join('\n')
    : '- Nenhum dado adicional verificado foi fornecido. Não invente avaliações, prêmios, números ou depoimentos.'
}

export function buildWebsitePrompt(input: PromptInput) {
  const company = valueOrFallback(input.companyName, '[NOME DA EMPRESA]')
  const niche = valueOrFallback(input.niche, '[NICHO]')
  const city = valueOrFallback(input.city, '[CIDADE/REGIÃO]')
  const services = valueOrFallback(input.services, 'defina os serviços a partir do contexto fornecido, sem inventar ofertas específicas')
  const differentiators = valueOrFallback(input.differentiators, 'extraia diferenciais apenas do contexto real; se não houver, use argumentos neutros como atendimento, clareza e conveniência sem criar fatos')
  const trustSignals = valueOrFallback(input.trustSignals, 'usar somente sinais reais presentes no contexto; não criar depoimentos, selos, anos de mercado ou números fictícios')
  const seo = valueOrFallback(input.seoKeywords, `${niche} em ${city}; ${company}; serviços de ${niche} em ${city}`)
  const integrations = valueOrFallback(input.integrations, 'WhatsApp, telefone clicável, formulário de contato e Google Maps quando houver dados')
  const technical = valueOrFallback(input.technicalRequirements, 'mobile-first, acessível, rápido, sem dependências desnecessárias e com componentes reutilizáveis')
  const imageDirection = valueOrFallback(input.imageDirection, `fotografia realista relacionada a ${niche}, contexto local e pessoas reais; evitar imagens genéricas com aparência de banco de imagens`)
  const implementation = valueOrFallback(input.implementationTarget, 'React + TypeScript + Tailwind CSS, com componentes organizados e pronto para deploy')

  return `Você é um product designer, copywriter de conversão e desenvolvedor frontend sênior. Crie um website de produção para **${company}**, empresa do segmento **${niche}** em **${city}**.

O entregável deve ser um site convincente, específico para este negócio e pronto para ser apresentado a um cliente real. Não entregue wireframe genérico, landing page vazia ou texto de exemplo.

## 1. CONTEXTO DO NEGÓCIO

**Empresa:** ${company}
**Segmento:** ${niche}
**Localização:** ${city}
**Descrição:** ${valueOrFallback(input.description, `Empresa local de ${niche} em ${city}.`)}
**Público-alvo:** ${valueOrFallback(input.targetAudience, `Pessoas e empresas de ${city} buscando ${niche} com intenção real de contratar.`)}
**Serviços/produtos principais:** ${services}
**Diferenciais a comunicar:** ${differentiators}

### Dados verificados que podem ser usados
${verifiedContext(input)}

REGRA CRÍTICA: Não invente avaliações, quantidade de clientes, anos de mercado, certificações, prêmios, cases, endereços, preços, parceiros ou depoimentos. Quando a informação não existir, escreva a seção de forma persuasiva sem fabricar evidência.

## 2. OBJETIVO E ESTRATÉGIA DE CONVERSÃO

**Tipo de projeto:** ${projectTypeLabel[input.projectType]}
**Objetivo principal:** ${valueOrFallback(input.siteGoal, 'gerar contatos qualificados e pedidos de orçamento')}
**CTA principal:** "${valueOrFallback(input.cta, 'Falar no WhatsApp')}"
**Tom da comunicação:** ${toneLabel[input.tone]}

A página deve conduzir o visitante em uma sequência clara:
problema/intenção → proposta de valor → serviços → diferenciais → prova/confiança → redução de objeções → CTA.

O CTA principal deve aparecer no hero, depois das seções de maior intenção e novamente no fechamento. Em mobile, considere CTA persistente discreto quando fizer sentido.

## 3. CONTRATO VISUAL ANTES DE IMPLEMENTAR

Antes de codificar, defina em poucas linhas um contrato visual específico para este projeto:

- **Tarefa e hierarquia:** o que o visitante precisa entender primeiro e qual ação deve ser mais fácil.
- **Direção:** 2 ou 3 atributos ligados ao segmento e como eles afetam tipografia, composição, imagens e densidade.
- **Sistema:** papéis de cor, contraste, espaçamento, raio e superfícies. Concentre a cor de ação; não use cromatismo decorativo em tudo.
- **Assinatura:** escolha no máximo um recurso visual característico que faça sentido para a marca sem esconder controles reconhecíveis.
- **Adaptação:** descreva como o layout reorganiza conteúdo em mobile e com textos longos.
- **Comportamento e prova:** liste estados relevantes (hover, foco, carregando, vazio, erro e sucesso) e o que será verificado antes de considerar pronto.

Não transforme automaticamente toda seção em card. Relações que pedem comparação devem manter alinhamento; sequências devem preservar ordem; conteúdo operacional deve priorizar clareza e feedback.

## 4. ARQUITETURA DE CONTEÚDO OBRIGATÓRIA

Monte a experiência com esta hierarquia, adaptando o texto ao negócio:

1. **Header**
   - logo/nome da empresa;
   - navegação curta e útil;
   - CTA principal visível;
   - versão mobile simples e funcional.

2. **Hero de alta intenção**
   - headline específica, sem frases genéricas como "transformando sonhos em realidade";
   - deixar claro o que a empresa faz, para quem e em qual região;
   - subtítulo focado no benefício real;
   - CTA principal + CTA secundário de baixa fricção;
   - elemento visual relevante ao nicho.

3. **Faixa de confiança**
   - usar somente: ${trustSignals};
   - se faltarem provas concretas, substituir por atributos verificáveis da experiência, sem números fictícios.

4. **Serviços / soluções**
   - apresentar: ${services};
   - cards com título curto, benefício e microcopy;
   - evitar descrições repetitivas.

5. **Por que escolher a empresa**
   - comunicar: ${differentiators};
   - transformar diferenciais em benefícios percebidos pelo cliente.

6. **Como funciona**
   - fluxo de contratação em 3 ou 4 passos;
   - simples, visual e específico ao nicho.

7. **Bloco local**
   - reforçar atendimento em ${city};
   - incluir endereço/mapa somente se houver dado real;
   - criar copy local natural, sem keyword stuffing.

8. **FAQ**
   - 5 a 7 perguntas reais de pré-venda;
   - responder objeções sobre atendimento, orçamento, prazo, região e processo;
   - não inventar políticas ou garantias.

9. **CTA final**
   - headline orientada à ação;
   - CTA "${valueOrFallback(input.cta, 'Falar no WhatsApp')}";
   - reduzir fricção e explicar o próximo passo.

10. **Footer**
    - contato, localização, links essenciais e identificação da empresa;
    - não criar CNPJ, redes sociais ou dados que não foram fornecidos.

## 5. COPYWRITING

- Escreva toda a copy final em português do Brasil.
- Não use Lorem Ipsum.
- Evite clichês como "qualidade e excelência", "soluções personalizadas" e "somos referência" sem sustentação.
- Headlines devem ser curtas, concretas e baseadas em benefício.
- Use linguagem que uma pessoa comum entenda rapidamente.
- Priorize clareza e intenção comercial em vez de texto excessivo.
- Inclua microcopy nos CTAs e formulários para reduzir incerteza.
- Use urgência apenas quando houver justificativa real; não crie escassez falsa.

## 6. DIREÇÃO VISUAL

**Estilo desejado:** ${valueOrFallback(input.visualStyle, 'premium, contemporâneo, limpo e confiável')}
**Paleta/base:** ${valueOrFallback(input.colors, 'defina uma paleta coerente com o segmento e alto contraste')}
**Direção de imagens:** ${imageDirection}

Requisitos visuais:
- aparência profissional de produto final, não template genérico;
- hierarquia tipográfica forte;
- grid consistente e bastante respiro;
- contraste acessível;
- uma única cor de destaque dominante;
- cards e bordas discretos, sem excesso de glassmorphism;
- ícones consistentes;
- microinterações suaves em hover/focus;
- animações curtas e funcionais, sem atrapalhar leitura;
- layout mobile tão bem resolvido quanto desktop.

## 7. SEO LOCAL E CONTEÚDO

Palavras-chave prioritárias:
${seo}

Implemente:
- title e meta description específicos;
- apenas um H1;
- H2/H3 semanticamente organizados;
- conteúdo local natural citando ${city};
- alt text descritivo nas imagens;
- Open Graph básico;
- JSON-LD do tipo LocalBusiness/ProfessionalService somente com dados realmente disponíveis;
- NAP consistente quando houver nome, endereço e telefone verificados.

## 8. FUNCIONALIDADES

Integrações/requisitos:
${integrations}

Quando houver telefone ou WhatsApp:
- criar links clicáveis corretos;
- preservar boa experiência mobile;
- não inventar números.

Formulários:
- campos mínimos necessários;
- mensagens de erro claras;
- feedback visual após envio;
- proteção básica contra estados inválidos.

## 9. IMPLEMENTAÇÃO TÉCNICA

**Alvo de implementação:** ${implementation}
**Requisitos adicionais:** ${technical}

Obrigatório:
- responsivo de 320px até telas grandes;
- componentes reutilizáveis;
- HTML semântico;
- foco visível e navegação por teclado;
- imagens otimizadas;
- evitar layout shift;
- estados de hover/focus/loading;
- boa performance percebida;
- não carregar bibliotecas pesadas sem necessidade;
- código organizado e fácil de manter.

## 10. CRITÉRIO DE QUALIDADE FINAL

Antes de considerar pronto, revise se:
- o hero explica o negócio em até 5 segundos;
- o site parece feito especificamente para ${company};
- existe uma jornada clara até o contato;
- nenhum dado foi inventado;
- a versão mobile está completa;
- os CTAs são consistentes;
- o conteúdo local está natural;
- o design tem acabamento profissional;
- não existem textos placeholder, links falsos ou seções vazias;
- a ação principal funciona por teclado e possui foco visível;
- estados de carregamento, vazio e erro não são confundidos entre si;
- a interface foi revisada em viewport ampla e estreita, com atenção a textos longos e quebra de layout.

Entregue o website completo, com copy final, estrutura visual final e interações essenciais implementadas. Não responda apenas com recomendações: **construa o site**.`
}
