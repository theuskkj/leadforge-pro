import {
  Clipboard,
  ExternalLink,
  MapPin,
  Phone,
  PhoneCall,
  Star,
  Trash2,
  WandSparkles,
} from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '../components/PageHeader'
import { PriorityBadge, StageBadge, WebsiteBadge } from '../components/Badges'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Textarea } from '../components/ui/textarea'
import { useAppData } from '../hooks/useAppData'
import { formatCurrency, formatDate, mapsUrl } from '../lib/utils'

export function LeadDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { leads, patchLead, removeLead, moveLeadStage } = useAppData()
  const lead = leads.find((item) => item.id === id)

  if (!lead) return <Navigate to="/leads" replace />

  return (
    <>
      <PageHeader
        eyebrow="CRM / Lead"
        title={lead.name}
        subtitle={`${lead.niche} · ${lead.city}`}
        actions={
          <>
            <Button variant="secondary" onClick={() => {
              patchLead(lead.id, { lastContact: new Date().toISOString() })
              toast.success('Contato marcado')
            }}>
              <PhoneCall className="size-4" />
              Marcar contato
            </Button>
            <Link
              to="/prompt-generator"
              state={{
                prefill: {
                  companyName: lead.name,
                  niche: lead.niche,
                  city: lead.city,
                  description: lead.notes || `Empresa local de ${lead.niche} em ${lead.city}.`,
                  targetAudience: `Pessoas e empresas de ${lead.city} buscando ${lead.niche}.`,
                  services: lead.niche,
                  siteGoal: 'Gerar contatos qualificados e pedidos de orçamento',
                  visualStyle: 'Premium, contemporâneo e confiável',
                  colors: '#0b0e13, #ff304d, #f7f8fb',
                  cta: lead.phone ? 'Falar no WhatsApp' : 'Solicitar orçamento',
                  verifiedAddress: lead.address,
                  verifiedPhone: lead.phone,
                  verifiedRating: lead.rating,
                  verifiedReviewCount: lead.reviewCount,
                },
              }}
            >
              <Button><WandSparkles className="size-4" />Criar website brief</Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.18fr_.82fr]">
        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap gap-2">
              <WebsiteBadge hasWebsite={Boolean(lead.website)} />
              <PriorityBadge priority={lead.priority} />
              <StageBadge stage={lead.stage} />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/[0.055] bg-white/[0.02] p-3.5">
                <p className="text-[9px] uppercase tracking-[.14em] text-zinc-600">Valor potencial</p>
                <p className="tabular mt-2 text-xl font-semibold tracking-[-0.03em] text-white">{formatCurrency(lead.potentialValue)}</p>
              </div>
              <div className="rounded-xl border border-white/[0.055] bg-white/[0.02] p-3.5">
                <p className="text-[9px] uppercase tracking-[.14em] text-zinc-600">Último contato</p>
                <p className="mt-2 text-[12px] font-semibold text-zinc-300">{formatDate(lead.lastContact)}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-white/[0.05] pt-5 text-[11px] text-zinc-500">
              <p className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-zinc-700" />
                <span>{lead.address}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="size-3.5 text-zinc-700" />
                <span>{lead.phone ?? 'Telefone não informado'}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Star className="size-3.5 fill-amber-300 text-amber-300" />
                <span>{lead.rating ? `${lead.rating.toFixed(1)} · ${lead.reviewCount} avaliações` : 'Sem avaliação pública'}</span>
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-white/[0.05] pt-5">
              <Button variant="outline" onClick={() => window.open(mapsUrl(lead.name, lead.address), '_blank')}>
                <ExternalLink className="size-4" />
                Google Maps
              </Button>
              {lead.website ? (
                <Button variant="outline" onClick={() => window.open(lead.website, '_blank')}>
                  <ExternalLink className="size-4" />
                  Site atual
                </Button>
              ) : null}
              <Button
                variant="secondary"
                onClick={() => moveLeadStage(lead.id, lead.stage === 'novo' ? 'contatado' : lead.stage === 'contatado' ? 'proposta' : 'fechado')}
              >
                Avançar estágio
              </Button>
              <Button variant="ghost" className="ml-auto text-zinc-600 hover:text-red-300" onClick={() => {
                if (confirm(`Excluir ${lead.name}?`)) {
                  removeLead(lead.id)
                  navigate('/leads')
                }
              }}>
                <Trash2 className="size-4" />
                Excluir
              </Button>
            </div>
          </Card>

          <Card>
            <div className="mb-4">
              <p className="text-sm font-semibold text-white">Histórico de atividades</p>
              <p className="mt-1 text-[10px] text-zinc-600">Registro cronológico das ações do lead.</p>
            </div>
            <div className="space-y-2">
              {lead.activities.slice().reverse().map((activity) => (
                <div key={activity.id} className="flex items-start justify-between gap-4 rounded-xl border border-white/[0.055] bg-white/[0.018] p-3">
                  <p className="text-[10px] leading-5 text-zinc-400">{activity.description}</p>
                  <p className="shrink-0 text-[9px] text-zinc-700">{formatDate(activity.createdAt)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <p className="text-sm font-semibold text-white">Notas comerciais</p>
            <p className="mt-1 text-[10px] text-zinc-600">Contexto útil para abordagem e follow-up.</p>
            <Textarea className="mt-4 min-h-40" value={lead.notes} onChange={(event) => patchLead(lead.id, { notes: event.target.value })} />
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Prompt salvo</p>
                <p className="mt-1 text-[10px] text-zinc-600">Briefing de website vinculado a este lead.</p>
              </div>
              <Button variant="ghost" className="size-9 px-0" onClick={async () => {
                if (!lead.prompt) {
                  toast.error('Nenhum prompt salvo.')
                  return
                }
                await navigator.clipboard.writeText(lead.prompt)
                toast.success('Prompt copiado')
              }}>
                <Clipboard className="size-4" />
              </Button>
            </div>
            <Textarea className="mt-4 min-h-64 font-mono text-[10px]" value={lead.prompt ?? ''} onChange={(event) => patchLead(lead.id, { prompt: event.target.value })} />
          </Card>
        </div>
      </div>
    </>
  )
}
