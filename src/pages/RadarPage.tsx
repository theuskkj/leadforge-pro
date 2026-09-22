import { useEffect, useMemo, useState } from 'react'
import {
  Building2,
  Check,
  ExternalLink,
  Globe2,
  LoaderCircle,
  MapPin,
  MapPinned,
  Phone,
  Save,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  WandSparkles,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '../components/PageHeader'
import { WebsiteBadge } from '../components/Badges'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Checkbox } from '../components/ui/checkbox'
import { Input } from '../components/ui/input'
import { useAppData } from '../hooks/useAppData'
import { computePriority, formatNumber, mapsUrl, uid } from '../lib/utils'
import { searchLeads } from '../services/leadSearchService'
import type { Lead, LeadSearchResult, SearchParams } from '../types'

const nicheSuggestions = [
  'dentistas',
  'clínicas',
  'advogados',
  'imobiliárias',
  'restaurantes',
  'academias',
  'arquitetos',
  'oficinas',
  'contabilidades',
  'salões de beleza',
  'concessionárias',
]


const RADAR_STATE_KEY = 'leadforge:radar-state:v1'

type SearchMeta = {
  scannedCount: number
  matchedCount: number
  partial: boolean
}

type PersistedRadarState = {
  params?: Partial<SearchParams>
  results?: LeadSearchResult[]
  showFilters?: boolean
  searched?: boolean
  lastSearchSignature?: string
  searchMeta?: SearchMeta
}

function loadRadarState(defaultLimit: number) {
  const fallbackParams: SearchParams = {
    country: 'Brasil',
    location: 'São Paulo - SP',
    niche: 'dentistas',
    limit: Math.min(defaultLimit, 20),
    onlyNoWebsite: false,
  }

  try {
    const raw = localStorage.getItem(RADAR_STATE_KEY)
    if (!raw) {
      return {
        params: fallbackParams,
        results: [] as LeadSearchResult[],
        showFilters: false,
        searched: false,
        lastSearchSignature: '',
        searchMeta: { scannedCount: 0, matchedCount: 0, partial: false },
      }
    }

    const parsed = JSON.parse(raw) as PersistedRadarState
    const savedParams = parsed.params ?? {}

    return {
      params: {
        ...fallbackParams,
        ...savedParams,
        limit: Math.min(20, Math.max(1, Number(savedParams.limit ?? fallbackParams.limit))),
        onlyNoWebsite: Boolean(savedParams.onlyNoWebsite),
        onlyWithPhone: Boolean(savedParams.onlyWithPhone),
        ...(typeof savedParams.minRating === 'number' ? { minRating: savedParams.minRating } : {}),
      } satisfies SearchParams,
      results: Array.isArray(parsed.results) ? parsed.results : [],
      showFilters: Boolean(parsed.showFilters),
      searched: Boolean(parsed.searched),
      lastSearchSignature: typeof parsed.lastSearchSignature === 'string' ? parsed.lastSearchSignature : '',
      searchMeta: parsed.searchMeta ?? { scannedCount: 0, matchedCount: 0, partial: false },
    }
  } catch {
    return {
      params: fallbackParams,
      results: [] as LeadSearchResult[],
      showFilters: false,
      searched: false,
      lastSearchSignature: '',
      searchMeta: { scannedCount: 0, matchedCount: 0, partial: false },
    }
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[.14em] text-zinc-600">{label}</span>
      {children}
    </label>
  )
}

export function RadarPage() {
  const { leads, addLead, settings } = useAppData()
  const navigate = useNavigate()
  const [initialRadarState] = useState(() => loadRadarState(settings.defaultResultLimit))
  const [params, setParams] = useState<SearchParams>(initialRadarState.params)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<LeadSearchResult[]>(initialRadarState.results)
  const [showFilters, setShowFilters] = useState(initialRadarState.showFilters)
  const [searched, setSearched] = useState(initialRadarState.searched)
  const [lastSearchSignature, setLastSearchSignature] = useState(initialRadarState.lastSearchSignature)
  const [searchMeta, setSearchMeta] = useState<SearchMeta>(initialRadarState.searchMeta)

  const currentSearchSignature = useMemo(() => JSON.stringify([
    params.country.trim().toLowerCase(),
    params.location.trim().toLowerCase(),
    params.niche.trim().toLowerCase(),
    Math.min(20, Math.max(1, params.limit)),
    Boolean(params.onlyNoWebsite),
    params.minRating ?? null,
    Boolean(params.onlyWithPhone),
  ]), [params])

  const canContinueSearch = searched && lastSearchSignature === currentSearchSignature

  useEffect(() => {
    const persisted: PersistedRadarState = {
      params,
      results,
      showFilters,
      searched,
      lastSearchSignature,
      searchMeta,
    }

    localStorage.setItem(RADAR_STATE_KEY, JSON.stringify(persisted))
  }, [params, results, showFilters, searched, lastSearchSignature, searchMeta])

  const leadsIndex = useMemo(() => {
    return new Map(
      leads.map((lead) => [
        `${lead.name.trim().toLowerCase()}::${lead.address.trim().toLowerCase()}`,
        lead,
      ]),
    )
  }, [leads])

  function getExistingLead(item: LeadSearchResult) {
    const byId = leads.find((lead) => lead.id === item.id)
    if (byId) return byId
    return leadsIndex.get(`${item.name.trim().toLowerCase()}::${item.address.trim().toLowerCase()}`)
  }


  function resultKeys(item: Pick<LeadSearchResult, 'id' | 'name' | 'address'>) {
    return [
      item.id.trim().toLowerCase(),
      `${item.name.trim().toLowerCase()}::${item.address.trim().toLowerCase()}`,
    ].filter(Boolean)
  }

  function leadKeys(item: Pick<Lead, 'id' | 'name' | 'address'>) {
    return [
      item.id.trim().toLowerCase(),
      `${item.name.trim().toLowerCase()}::${item.address.trim().toLowerCase()}`,
    ].filter(Boolean)
  }

  const visibleResults = useMemo(
    () => results.filter((item) => !getExistingLead(item)),
    [results, leads, leadsIndex],
  )

  function toLead(item: LeadSearchResult): Lead {
    const existing = getExistingLead(item)
    if (existing) return existing

    const now = new Date().toISOString()
    const nextLead: Lead = {
      id: item.id || uid(),
      name: item.name,
      niche: item.niche,
      country: params.country,
      city: item.city,
      address: item.address,
      rating: item.rating,
      reviewCount: item.reviewCount,
      priority: computePriority({ hasWebsite: item.hasWebsite, rating: item.rating, reviewCount: item.reviewCount, hasPhone: Boolean(item.phone) }),
      potentialValue: settings.defaultPotentialValue,
      stage: 'novo',
      notes: '',
      createdAt: now,
      updatedAt: now,
      activities: [{ id: uid(), type: 'created', description: 'Lead salvo via radar', createdAt: now }],
      ...(item.phone ? { phone: item.phone } : {}),
      ...(item.website ? { website: item.website } : {}),
    }

    addLead(nextLead)
    return nextLead
  }

  async function onSearch() {
    if (!params.location.trim() || !params.niche.trim()) {
      toast.error('Informe uma localização e um nicho para pesquisar.')
      return
    }

    const continuing = canContinueSearch
    const round = continuing ? (params.searchRound ?? 0) : 0
    const excludeKeys = Array.from(new Set([
      ...leads.flatMap(leadKeys),
      ...(continuing ? results.flatMap(resultKeys) : []),
    ])).slice(-500)

    setLoading(true)
    setSearched(true)
    try {
      const response = await searchLeads({
        ...params,
        limit: Math.min(20, Math.max(1, params.limit)),
        searchRound: round,
        excludeKeys,
      }, settings)

      if (continuing) {
        setResults((current) => {
          const seen = new Set<string>()
          const merged = [...current, ...response.results].filter((item) => {
            const key = item.id || `${item.name.trim().toLowerCase()}::${item.address.trim().toLowerCase()}`
            if (seen.has(key)) return false
            seen.add(key)
            return true
          })
          return merged.slice(0, 250)
        })
      } else {
        setResults(response.results)
      }

      setParams((current) => ({ ...current, searchRound: round + 1 }))
      setLastSearchSignature(currentSearchSignature)
      setSearchMeta({
        scannedCount: response.scannedCount ?? 0,
        matchedCount: response.matchedCount ?? response.results.length,
        partial: Boolean(response.partial),
      })

      if (response.error) toast.error(response.error)
      else if (continuing && response.results.length === 0) toast.info('Nenhuma empresa nova encontrada neste lote. Tente novamente para explorar outra região.')
    } finally {
      setLoading(false)
    }
  }

  const noWebsiteCount = visibleResults.filter((result) => !result.hasWebsite).length

  return (
    <>
      <PageHeader
        eyebrow="Radar comercial"
        title="Encontre empresas prontas para virar clientes."
        subtitle="Pesquise negócios locais, identifique quem ainda não tem website e leve as melhores oportunidades direto para o seu pipeline."
      />

      <Card className="overflow-hidden p-0">
        <div className="border-b border-white/[0.06] bg-[radial-gradient(circle_at_80%_-20%,rgba(255,36,56,.13),transparent_28rem)] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-2xl border border-[#ff2438]/20 bg-[#ff2438]/10">
              <Search className="size-4.5 text-[#ff5668]" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-white">Nova pesquisa</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">Busque empresas por nicho e localização diretamente no Google Maps.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-[.8fr_1.35fr_1.2fr_.55fr]">
            <Field label="País">
              <Input value={params.country} onChange={(e) => setParams((value) => ({ ...value, country: e.target.value }))} />
            </Field>
            <Field label="Localização">
              <Input value={params.location} onChange={(e) => setParams((value) => ({ ...value, location: e.target.value }))} placeholder="Cidade, estado ou região" />
            </Field>
            <Field label="Nicho">
              <>
                <Input list="leadforge-niches" value={params.niche} onChange={(e) => setParams((value) => ({ ...value, niche: e.target.value }))} placeholder="Ex.: dentistas, clínicas, imobiliárias" />
                <datalist id="leadforge-niches">{nicheSuggestions.map((niche) => <option key={niche} value={niche} />)}</datalist>
              </>
            </Field>
            <Field label="Resultados">
              <Input type="number" min={1} max={20} value={params.limit} onChange={(e) => setParams((value) => ({ ...value, limit: Math.min(20, Number(e.target.value) || 1) }))} />
            </Field>
          </div>

          {showFilters ? (
            <div className="mt-4 grid gap-3 rounded-2xl border border-white/[0.06] bg-black/10 p-4 sm:grid-cols-3">
              <Field label="Nota mínima">
                <Input type="number" min={0} max={5} step="0.1" value={params.minRating ?? ''} onChange={(e) => setParams((value) => ({ ...value, minRating: e.target.value ? Number(e.target.value) : undefined }))} placeholder="Ex.: 4.0" />
              </Field>
              <label className="flex min-h-11 items-center gap-3 self-end rounded-xl border border-white/[0.07] bg-[#0d0e11] px-3.5 text-xs text-zinc-400">
                <Checkbox checked={params.onlyNoWebsite} onChange={(e) => setParams((value) => ({ ...value, onlyNoWebsite: e.target.checked }))} />
                Somente sem site
              </label>
              <label className="flex min-h-11 items-center gap-3 self-end rounded-xl border border-white/[0.07] bg-[#0d0e11] px-3.5 text-xs text-zinc-400">
                <Checkbox checked={params.onlyWithPhone ?? false} onChange={(e) => setParams((value) => ({ ...value, onlyWithPhone: e.target.checked }))} />
                Somente com telefone
              </label>
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" onClick={() => setShowFilters((value) => !value)} className="justify-start sm:justify-center">
              <SlidersHorizontal className="size-4" /> {showFilters ? 'Ocultar filtros' : 'Filtros avançados'}
            </Button>
            <Button onClick={onSearch} disabled={loading} className="h-11 px-5">
              {loading ? <LoaderCircle className="size-4 animate-spin" /> : <Search className="size-4" />}
              {loading ? 'Buscando empresas...' : canContinueSearch ? 'Buscar mais empresas' : 'Buscar empresas'}
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="pro-panel h-[250px] animate-pulse rounded-[20px] bg-white/[0.025]" />
          ))}
        </div>
      ) : null}

      {!loading && searched ? (
        <>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-200">{visibleResults.length} empresas novas encontradas</p>
              <p className="mt-1 text-xs text-zinc-600">
                {noWebsiteCount} sem website · {searchMeta.scannedCount > 0 ? `${searchMeta.scannedCount} analisadas no Maps nesta rodada · ` : ''}ordenadas por oportunidade
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.1em] text-emerald-300">
              <Globe2 className="size-3.5" />
              Google Maps Scraper
            </span>
          </div>

          {visibleResults.length === 0 ? (
            <Card className="mt-4 py-14 text-center">
              <div className="mx-auto grid size-11 place-items-center rounded-2xl border border-white/[0.07] bg-white/[0.035]">
                <Search className="size-5 text-zinc-600" />
              </div>
              <p className="mt-4 text-sm font-medium text-zinc-200">Nenhuma empresa nova encontrada neste lote</p>
              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-zinc-600">
                {searchMeta.scannedCount > 0
                  ? `O Google Maps retornou ${searchMeta.scannedCount} empresas nesta região, mas nenhuma passou pelos filtros atuais.`
                  : 'Esta região não retornou empresas para a consulta atual.'}
              </p>
              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-zinc-500">
                Clique em <strong className="text-zinc-300">Buscar mais empresas</strong> para avançar automaticamente para outra região.
              </p>
            </Card>
          ) : (
            <div className="mt-4 grid gap-3 xl:grid-cols-2">
              {[...visibleResults].sort((a, b) => b.priority - a.priority).map((item) => {
                const saved = Boolean(getExistingLead(item))
                const mapLink = item.googleMapsUrl || mapsUrl(item.name, item.address)
                return (
                  <Card key={item.id} className="pro-card-hover flex min-h-[250px] flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <WebsiteBadge hasWebsite={item.hasWebsite} />
                        <span className="rounded-full border border-white/[0.07] bg-white/[0.035] px-2.5 py-1 text-[10px] font-medium text-zinc-500">{item.niche}</span>
                      </div>
                      <div className="text-right">
                        <p className="tabular text-[28px] font-semibold tracking-[-0.05em] text-white">{item.priority}</p>
                        <p className="text-[9px] font-semibold uppercase tracking-[.12em] text-zinc-600">prioridade</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-white">{item.name}</h3>
                      <div className="mt-3 space-y-2 text-xs text-zinc-500">
                        <p className="flex items-start gap-2"><MapPin className="mt-0.5 size-3.5 shrink-0 text-zinc-600" /><span>{item.address}</span></p>
                        <p className="flex items-center gap-2"><Phone className="size-3.5 text-zinc-600" /><span>{item.phone || 'Telefone não informado'}</span></p>
                        <p className="flex items-center gap-2">
                          <Star className="size-3.5 fill-amber-300 text-amber-300" />
                          <span className="font-medium text-zinc-300">{item.rating ? item.rating.toFixed(1) : '—'}</span>
                          <span>· {formatNumber(item.reviewCount)} avaliações</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto flex flex-wrap gap-2 border-t border-white/[0.055] pt-4">
                      <Button onClick={() => toLead(item)} disabled={saved} className="sm:min-w-[118px]">
                        {saved ? <Check className="size-4" /> : <Save className="size-4" />}{saved ? 'Salvo' : 'Salvar lead'}
                      </Button>
                      <Button variant="secondary" onClick={() => {
                        const lead = toLead(item)
                        navigate(`/lead/${lead.id}`)
                      }}>Detalhes</Button>
                      <a href={mapLink} target="_blank" rel="noreferrer"><Button variant="outline"><MapPinned className="size-4" />Maps</Button></a>
                      <Button variant="ghost" onClick={() => navigate('/prompt-generator', { state: { prefill: { companyName: item.name, niche: item.niche, city: item.city, description: `Empresa encontrada no radar em ${item.city}.`, targetAudience: '', services: item.niche, siteGoal: 'Gerar contatos qualificados', visualStyle: 'Premium e confiável', colors: '#070708, #ff2438', cta: 'Solicitar orçamento' } } })}>
                        <WandSparkles className="size-4" />Gerar site
                      </Button>
                      {item.website ? <a href={item.website} target="_blank" rel="noreferrer" className="ml-auto"><Button variant="ghost"><ExternalLink className="size-4" />Site</Button></a> : null}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      ) : null}

      {!searched && !loading ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { title: 'Pesquise negócios reais', description: 'O scraper pesquisa empresas reais no Google Maps por nicho e região.', icon: Globe2 },
            { title: 'Priorize oportunidades', description: 'O score favorece empresas sem site e com boa demanda.', icon: Sparkles },
            { title: 'Leve para o pipeline', description: 'Salve o lead e acompanhe cada etapa comercial.', icon: Building2 },
          ].map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="rounded-2xl border border-white/[0.055] bg-white/[0.02] p-4">
                <Icon className="size-4 text-[#ff5668]" />
                <p className="mt-3 text-xs font-medium text-zinc-300">{feature.title}</p>
                <p className="mt-1.5 text-[11px] leading-5 text-zinc-600">{feature.description}</p>
              </div>
            )
          })}
        </div>
      ) : null}
    </>
  )
}
