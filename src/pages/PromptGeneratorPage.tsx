import {
  BriefcaseBusiness,
  CheckCircle2,
  Clipboard,
  Code2,
  Eraser,
  FileText,
  MapPin,
  Palette,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  WandSparkles,
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import { useAppData } from '../hooks/useAppData'
import {
  buildWebsitePrompt,
  type ProjectType,
  type PromptInput,
  type PromptTone,
} from '../lib/promptBuilder'

const PROMPT_DRAFT_KEY = 'leadforge:prompt-studio:v2'

const emptyInput: PromptInput = {
  companyName: '',
  niche: '',
  city: '',
  description: '',
  targetAudience: '',
  services: '',
  differentiators: '',
  siteGoal: 'Gerar contatos qualificados e pedidos de orçamento',
  projectType: 'landing',
  tone: 'direto',
  visualStyle: 'Premium, contemporâneo, limpo e confiável',
  colors: '#0b0e13, #ff304d, #f7f8fb',
  cta: 'Falar no WhatsApp',
  trustSignals: '',
  seoKeywords: '',
  imageDirection: 'Fotografia realista do negócio, equipe, ambiente e contexto local. Evitar imagens genéricas com aparência artificial.',
  integrations: 'WhatsApp, telefone clicável, formulário de contato e Google Maps',
  technicalRequirements: 'Mobile-first, acessibilidade, carregamento rápido, componentes reutilizáveis e estados de interação bem resolvidos.',
  implementationTarget: 'React + TypeScript + Tailwind CSS',
}

const presets = [
  {
    id: 'conversion',
    label: 'Conversão local',
    description: 'Direto ao WhatsApp, forte intenção local e estrutura enxuta.',
    icon: Target,
    patch: {
      projectType: 'landing' as ProjectType,
      tone: 'direto' as PromptTone,
      siteGoal: 'Gerar contatos qualificados e pedidos de orçamento',
      visualStyle: 'Comercial premium, claro, objetivo e orientado à conversão',
      cta: 'Falar no WhatsApp',
    },
  },
  {
    id: 'premium',
    label: 'Marca premium',
    description: 'Mais percepção de valor, confiança e acabamento visual.',
    icon: Sparkles,
    patch: {
      projectType: 'institucional' as ProjectType,
      tone: 'premium' as PromptTone,
      siteGoal: 'Aumentar percepção de valor, confiança e geração de oportunidades',
      visualStyle: 'Premium editorial, sofisticado, espaçoso e com forte direção de arte',
      cta: 'Solicitar atendimento',
    },
  },
  {
    id: 'authority',
    label: 'Autoridade técnica',
    description: 'Ideal para serviços complexos, B2B e negócios consultivos.',
    icon: ShieldCheck,
    patch: {
      projectType: 'institucional' as ProjectType,
      tone: 'tecnico' as PromptTone,
      siteGoal: 'Construir autoridade e converter visitantes em oportunidades comerciais qualificadas',
      visualStyle: 'Corporativo contemporâneo, técnico e altamente confiável',
      cta: 'Solicitar diagnóstico',
    },
  },
] as const

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[.14em] text-zinc-500">{label}</span>
        {hint ? <span className="text-[9px] text-zinc-700">{hint}</span> : null}
      </div>
      {children}
    </label>
  )
}

function loadStoredDraft() {
  try {
    const raw = localStorage.getItem(PROMPT_DRAFT_KEY)
    if (!raw) return undefined
    return JSON.parse(raw) as Partial<PromptInput>
  } catch {
    return undefined
  }
}

export function PromptGeneratorPage() {
  const { leads, storePrompt } = useAppData()
  const location = useLocation()
  const prefill = location.state && typeof location.state === 'object' && 'prefill' in location.state
    ? (location.state.prefill as Partial<PromptInput>)
    : undefined

  const [selectedLead, setSelectedLead] = useState('')
  const [form, setForm] = useState<PromptInput>(() => ({
    ...emptyInput,
    ...loadStoredDraft(),
    ...prefill,
  }))
  const [output, setOutput] = useState('')

  const leadOptions = useMemo(
    () => leads.map((lead) => ({ id: lead.id, name: lead.name })),
    [leads],
  )

  const quality = useMemo(() => {
    const checks = [
      form.companyName,
      form.niche,
      form.city,
      form.description,
      form.targetAudience,
      form.services,
      form.differentiators,
      form.siteGoal,
      form.visualStyle,
      form.cta,
      form.seoKeywords,
      form.imageDirection,
    ]
    const completed = checks.filter((value) => value.trim().length >= 3).length
    return Math.round((completed / checks.length) * 100)
  }, [form])

  useEffect(() => {
    localStorage.setItem(PROMPT_DRAFT_KEY, JSON.stringify(form))
  }, [form])

  function patchForm(patch: Partial<PromptInput>) {
    setForm((value) => ({ ...value, ...patch }))
  }

  function applyLead(leadId: string) {
    setSelectedLead(leadId)
    const lead = leads.find((item) => item.id === leadId)
    if (!lead) return

    patchForm({
      companyName: lead.name,
      niche: lead.niche,
      city: lead.city,
      description: lead.notes || `Empresa local de ${lead.niche} em ${lead.city}.`,
      targetAudience: `Pessoas e empresas da região de ${lead.city} procurando ${lead.niche} com intenção de contratar.`,
      services: lead.niche,
      siteGoal: 'Gerar contatos qualificados e pedidos de orçamento',
      cta: lead.phone ? 'Falar no WhatsApp' : 'Solicitar orçamento',
      verifiedAddress: lead.address,
      verifiedPhone: lead.phone,
      verifiedRating: lead.rating,
      verifiedReviewCount: lead.reviewCount,
      trustSignals: lead.rating > 0
        ? `Avaliação pública de ${lead.rating.toFixed(1)}/5 com ${lead.reviewCount} avaliações, se esses dados forem exibidos exatamente como verificados.`
        : '',
      seoKeywords: `${lead.niche} em ${lead.city}; ${lead.name}; ${lead.niche} ${lead.city}`,
    })
  }

  function generatePrompt() {
    if (!form.companyName.trim() || !form.niche.trim() || !form.city.trim()) {
      toast.error('Preencha empresa, nicho e cidade antes de gerar.')
      return
    }
    setOutput(buildWebsitePrompt(form))
  }

  async function copyPrompt() {
    if (!output) {
      toast.error('Gere um prompt primeiro.')
      return
    }
    await navigator.clipboard.writeText(output)
    toast.success('Prompt completo copiado')
  }

  return (
    <>
      <PageHeader
        eyebrow="AI Website Brief"
        title="Prompt Studio"
        subtitle="Transforme um lead real em um briefing de website específico, orientado à conversão e pronto para Lovable, v0, Copilot ou outro gerador."
        actions={
          <>
            <Button variant="outline" onClick={() => {
              setForm(emptyInput)
              setOutput('')
              setSelectedLead('')
              localStorage.removeItem(PROMPT_DRAFT_KEY)
            }}>
              <Eraser className="size-4" />
              Novo briefing
            </Button>
            <Button onClick={generatePrompt}>
              <WandSparkles className="size-4" />
              Gerar prompt completo
            </Button>
          </>
        }
      />

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        {presets.map((preset) => {
          const Icon = preset.icon
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => patchForm(preset.patch)}
              className="group rounded-2xl border border-white/[0.065] bg-white/[0.025] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#ff304d]/25 hover:bg-white/[0.04]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-9 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-zinc-400 transition group-hover:border-[#ff304d]/20 group-hover:bg-[#ff304d]/[0.07] group-hover:text-[#ff6378]">
                  <Icon className="size-4" />
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[.15em] text-zinc-700">Preset</span>
              </div>
              <p className="mt-4 text-[13px] font-semibold text-zinc-200">{preset.label}</p>
              <p className="mt-1.5 text-[11px] leading-5 text-zinc-600">{preset.description}</p>
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.12fr)_minmax(430px,.88fr)]">
        <div className="space-y-4">
          <Card>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="grid size-9 place-items-center rounded-xl border border-[#ff304d]/20 bg-[#ff304d]/[0.08] text-[#ff6378]">
                  <BriefcaseBusiness className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Contexto do lead</p>
                  <p className="mt-1 text-[11px] text-zinc-600">Dados que deixam a copy específica para a empresa.</p>
                </div>
              </div>
              <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[9px] font-medium text-zinc-500">
                dados reais
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field label="Lead salvo" hint="opcional">
                  <Select value={selectedLead} onChange={(event) => applyLead(event.target.value)}>
                    <option value="">Selecionar lead da base</option>
                    {leadOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </Select>
                </Field>
              </div>
              <Field label="Empresa">
                <Input value={form.companyName} onChange={(event) => patchForm({ companyName: event.target.value })} placeholder="Nome da empresa" />
              </Field>
              <Field label="Nicho">
                <Input value={form.niche} onChange={(event) => patchForm({ niche: event.target.value })} placeholder="Ex.: energia solar" />
              </Field>
              <Field label="Cidade / região">
                <Input value={form.city} onChange={(event) => patchForm({ city: event.target.value })} placeholder="Ex.: São Paulo - SP" />
              </Field>
              <Field label="Tipo de projeto">
                <Select value={form.projectType} onChange={(event) => patchForm({ projectType: event.target.value as ProjectType })}>
                  <option value="landing">Landing page de conversão</option>
                  <option value="institucional">Site institucional completo</option>
                  <option value="catalogo">Site com catálogo comercial</option>
                </Select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Descrição do negócio">
                  <Textarea value={form.description} onChange={(event) => patchForm({ description: event.target.value })} placeholder="O que a empresa faz, posicionamento, região atendida e contexto importante." />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Serviços / produtos">
                  <Textarea value={form.services} onChange={(event) => patchForm({ services: event.target.value })} placeholder="Liste os principais serviços separados por vírgula ou linha." />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Diferenciais reais" hint="não inventar">
                  <Textarea value={form.differentiators} onChange={(event) => patchForm({ differentiators: event.target.value })} placeholder="Ex.: atendimento consultivo, prazo rápido, equipe própria, suporte pós-venda..." />
                </Field>
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-5 flex items-start gap-3">
              <span className="grid size-9 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-zinc-400">
                <Target className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Estratégia de conversão</p>
                <p className="mt-1 text-[11px] text-zinc-600">Defina quem precisa ser convencido, por quê e qual ação deve acontecer.</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field label="Público-alvo">
                  <Textarea value={form.targetAudience} onChange={(event) => patchForm({ targetAudience: event.target.value })} placeholder="Quem compra, o que procura e qual problema quer resolver." />
                </Field>
              </div>
              <Field label="Objetivo principal">
                <Input value={form.siteGoal} onChange={(event) => patchForm({ siteGoal: event.target.value })} />
              </Field>
              <Field label="CTA principal">
                <Input value={form.cta} onChange={(event) => patchForm({ cta: event.target.value })} placeholder="Falar no WhatsApp" />
              </Field>
              <Field label="Tom da copy">
                <Select value={form.tone} onChange={(event) => patchForm({ tone: event.target.value as PromptTone })}>
                  <option value="direto">Direto e comercial</option>
                  <option value="premium">Premium e sofisticado</option>
                  <option value="acolhedor">Humano e acolhedor</option>
                  <option value="tecnico">Técnico e autoritativo</option>
                </Select>
              </Field>
              <Field label="Sinais de confiança" hint="somente reais">
                <Input value={form.trustSignals} onChange={(event) => patchForm({ trustSignals: event.target.value })} placeholder="Avaliações, certificações, cases verificados..." />
              </Field>
            </div>
          </Card>

          <Card>
            <div className="mb-5 flex items-start gap-3">
              <span className="grid size-9 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-zinc-400">
                <Palette className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Direção visual e SEO</p>
                <p className="mt-1 text-[11px] text-zinc-600">Transforme o briefing em um sistema visual e conteúdo local coerente.</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Estilo visual">
                <Input value={form.visualStyle} onChange={(event) => patchForm({ visualStyle: event.target.value })} />
              </Field>
              <Field label="Paleta">
                <Input value={form.colors} onChange={(event) => patchForm({ colors: event.target.value })} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Direção de imagens">
                  <Textarea value={form.imageDirection} onChange={(event) => patchForm({ imageDirection: event.target.value })} />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Keywords de SEO local">
                  <Textarea value={form.seoKeywords} onChange={(event) => patchForm({ seoKeywords: event.target.value })} placeholder="Ex.: energia solar São Paulo, instalação painel solar SP..." />
                </Field>
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-5 flex items-start gap-3">
              <span className="grid size-9 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-zinc-400">
                <Code2 className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Implementação</p>
                <p className="mt-1 text-[11px] text-zinc-600">Diga ao gerador exatamente o que precisa funcionar no site final.</p>
              </div>
            </div>

            <div className="grid gap-3">
              <Field label="Ferramentas / integrações">
                <Textarea value={form.integrations} onChange={(event) => patchForm({ integrations: event.target.value })} />
              </Field>
              <Field label="Alvo técnico">
                <Input value={form.implementationTarget} onChange={(event) => patchForm({ implementationTarget: event.target.value })} />
              </Field>
              <Field label="Requisitos técnicos">
                <Textarea value={form.technicalRequirements} onChange={(event) => patchForm({ technicalRequirements: event.target.value })} />
              </Field>
            </div>
          </Card>
        </div>

        <div className="2xl:sticky 2xl:top-[76px] 2xl:self-start">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-white/[0.06] bg-[radial-gradient(circle_at_85%_0%,rgba(255,48,77,.12),transparent_18rem)] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-[#ff6378]" />
                    <p className="text-sm font-semibold text-white">Briefing gerado</p>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-5 text-zinc-600">Prompt pronto para colar em um gerador de website.</p>
                </div>
                <span className="rounded-full border border-white/[0.07] bg-black/20 px-2.5 py-1 text-[9px] font-semibold text-zinc-400">
                  {quality}% completo
                </span>
              </div>

              <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.055]">
                <div className="h-full rounded-full bg-[#ff304d] transition-all" style={{ width: `${quality}%` }} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={generatePrompt}>
                  <WandSparkles className="size-4" />
                  Gerar
                </Button>
                <Button variant="secondary" onClick={copyPrompt}>
                  <Clipboard className="size-4" />
                  Copiar
                </Button>
                <Button
                  variant="outline"
                  disabled={!selectedLead || !output}
                  onClick={() => {
                    if (!selectedLead || !output) return
                    storePrompt(selectedLead, output)
                    toast.success('Prompt salvo no lead')
                  }}
                >
                  <Save className="size-4" />
                  Salvar no lead
                </Button>
              </div>
            </div>

            <div className="max-h-[calc(100vh-280px)] min-h-[520px] overflow-auto bg-[#090c11] p-5 sm:p-6">
              {output ? (
                <pre className="whitespace-pre-wrap font-sans text-[12px] leading-6 text-zinc-300">{output}</pre>
              ) : (
                <div className="flex min-h-[460px] flex-col items-center justify-center text-center">
                  <span className="grid size-12 place-items-center rounded-2xl border border-white/[0.07] bg-white/[0.03]">
                    <WandSparkles className="size-5 text-zinc-600" />
                  </span>
                  <p className="mt-4 text-sm font-medium text-zinc-300">Seu prompt aparece aqui</p>
                  <p className="mt-2 max-w-[320px] text-[11px] leading-5 text-zinc-600">
                    Quanto mais contexto real você fornecer, menos genérico será o site criado pela IA.
                  </p>
                  <div className="mt-6 grid w-full max-w-sm gap-2 text-left">
                    {[
                      ['Contexto comercial', BriefcaseBusiness],
                      ['Estratégia de conversão', Target],
                      ['Direção visual', Palette],
                      ['SEO e requisitos técnicos', Search],
                    ].map(([label, Icon]) => {
                      const ItemIcon = Icon as typeof MapPin
                      return (
                        <div key={label as string} className="flex items-center gap-2.5 rounded-xl border border-white/[0.055] bg-white/[0.02] px-3 py-2.5 text-[10px] text-zinc-500">
                          <CheckCircle2 className="size-3.5 text-zinc-700" />
                          <ItemIcon className="size-3.5 text-zinc-600" />
                          {label as string}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
