import { useState } from 'react'
import { ExternalLink, LoaderCircle, MapPinned, Save, WandSparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { PriorityBadge, WebsiteBadge } from '../components/Badges'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Checkbox } from '../components/ui/checkbox'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { useAppData } from '../hooks/useAppData'
import { computePriority, mapsUrl, uid } from '../lib/utils'
import { searchLeads } from '../services/leadSearchService'
import type { LeadSearchResult, SearchParams } from '../types'

const niches = ['concessionárias', 'arquitetos', 'clínicas', 'restaurantes', 'academias', 'imobiliárias', 'salões', 'oficinas', 'contabilidades', 'advogados']

export function RadarPage() {
  const { addLead, settings } = useAppData()
  const navigate = useNavigate()
  const [params, setParams] = useState<SearchParams>({
    country: 'Brasil',
    location: 'São Paulo',
    niche: 'concessionárias',
    limit: settings.defaultResultLimit,
    onlyNoWebsite: true,
  })
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<LeadSearchResult[]>([])
  const [isDemo, setIsDemo] = useState(false)

  async function onSearch() {
    setLoading(true)
    const response = await searchLeads(params)
    setResults(response.results)
    setIsDemo(response.isDemo)
    setLoading(false)
  }

  function saveFromResult(item: LeadSearchResult) {
    addLead({
      id: uid(),
      name: item.name,
      niche: item.niche,
      country: params.country,
      city: item.city,
      address: item.address,
      phone: item.phone,
      website: item.website,
      rating: item.rating,
      reviewCount: item.reviewCount,
      priority: computePriority({ hasWebsite: item.hasWebsite, rating: item.rating, reviewCount: item.reviewCount, hasPhone: Boolean(item.phone) }),
      potentialValue: settings.defaultPotentialValue,
      stage: 'novo',
      lastContact: undefined,
      notes: '',
      prompt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activities: [{ id: uid(), type: 'created', description: 'Lead salvo via radar', createdAt: new Date().toISOString() }],
    })
  }

  return (
    <>
      <PageHeader title="Radar de leads" subtitle="Pesquise empresas locais e salve oportunidades" />
      <Card>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input value={params.country} onChange={(e) => setParams((v) => ({ ...v, country: e.target.value }))} placeholder="País" />
          <Input value={params.location} onChange={(e) => setParams((v) => ({ ...v, location: e.target.value }))} placeholder="Cidade / estado / região" />
          <Select value={params.niche} onChange={(e) => setParams((v) => ({ ...v, niche: e.target.value }))}>
            {niches.map((niche) => <option key={niche}>{niche}</option>)}
          </Select>
          <Input type="number" min={1} max={100} value={params.limit} onChange={(e) => setParams((v) => ({ ...v, limit: Number(e.target.value) }))} placeholder="Máximo" />
          <Input type="number" min={0} max={5} step="0.1" value={params.minRating ?? ''} onChange={(e) => setParams((v) => ({ ...v, minRating: e.target.value ? Number(e.target.value) : undefined }))} placeholder="Nota mínima" />
          <div className="flex items-center gap-2 rounded-2xl border border-zinc-700 bg-[#1a1a1d] px-3 text-sm text-zinc-300">
            <Checkbox checked={params.onlyWithPhone ?? false} onChange={(e) => setParams((v) => ({ ...v, onlyWithPhone: e.target.checked }))} />
            Somente com telefone
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-zinc-700 bg-[#1a1a1d] px-3 text-sm text-zinc-300">
            <Checkbox checked={params.onlyNoWebsite} onChange={(e) => setParams((v) => ({ ...v, onlyNoWebsite: e.target.checked }))} />
            Somente sem site
          </div>
          <Button onClick={onSearch} className="h-11">
            {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
            Buscar
          </Button>
        </div>
      </Card>

      {isDemo ? <p className="mt-3 inline-flex rounded-full bg-amber-900/60 px-3 py-1 text-xs text-amber-200">Demonstração</p> : null}

      <div className="mt-4 grid gap-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-3xl bg-zinc-900" />)
          : results.map((item) => (
              <Card key={item.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{item.name}</p>
                    <p className="text-sm text-zinc-400">{item.niche} • {item.address}</p>
                    <p className="text-sm text-zinc-500">⭐ {item.rating} ({item.reviewCount} avaliações) {item.phone ? `• ${item.phone}` : ''}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <WebsiteBadge hasWebsite={item.hasWebsite} />
                    <PriorityBadge priority={item.priority} />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => saveFromResult(item)}><Save className="mr-1 h-4 w-4" />Salvar lead</Button>
                  <Button variant="ghost" onClick={() => navigate(`/lead/${item.id}`)}>Detalhes</Button>
                  <a href={mapsUrl(item.name, item.address)} target="_blank" rel="noreferrer"><Button variant="outline"><MapPinned className="mr-1 h-4 w-4" />Google Maps</Button></a>
                  <Button variant="outline" onClick={() => navigate('/prompt-generator', { state: { prefill: { companyName: item.name, niche: item.niche, city: item.city, description: `Empresa encontrada no radar em ${item.city}.`, targetAudience: '', services: item.niche, siteGoal: 'Gerar contatos qualificados', visualStyle: 'Premium escuro', colors: '#070708, #ff2438', cta: 'Solicitar orçamento' } } })}><WandSparkles className="mr-1 h-4 w-4" />Gerar prompt</Button>
                  {item.website ? <a href={item.website} target="_blank" rel="noreferrer"><Button variant="ghost"><ExternalLink className="mr-1 h-4 w-4" />Site</Button></a> : null}
                </div>
              </Card>
            ))}
      </div>
    </>
  )
}
