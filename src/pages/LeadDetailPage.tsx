import {
  ArrowRight,
  Clipboard,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
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
import { buildWhatsAppApproach, formatCurrency, formatDate, mapsUrl, whatsappUrl } from '../lib/utils'

export function LeadDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { leads, patchLead, removeLead, moveLeadStage } = useAppData()
  const lead = leads.find((item) => item.id === id)

  if (!lead) return <Navigate to="/leads" replace />

  const whatsappMessage = buildWhatsAppApproach({
    companyName: lead.name,
    niche: lead.niche,
    city: lead.city,
    hasWebsite: Boolean(lead.website),
  })
  const whatsappLink = lead.phone ? whatsappUrl(lead.phone, whatsappMessage) : ''

  function openWhatsApp() {
    if (!whatsappLink) {
      toast.error('Este lead não possui telefone para contato no WhatsApp.')
      return
    }
    window.open(whatsappLink, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <PageHeader
        eyebrow="CRM / Lead"
        title={lead.name}
        subtitle={`${lead.niche} · ${lead.city}`}
        actions={
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
                visualStyle: 'Autoral, claro, confiável e adequado ao segmento',
                colors: '#08090c, #d92d46, #f7f8fb',
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
        }
      />

      <div className="grid gap-3 xl:grid-cols-[1.28fr_.72fr]">
        <div className="space-y-3">
          <Card className="p-0">
            <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.055] px-5 py-4">
              <WebsiteBadge hasWebsite={Boolean(lead.website)} />
              <PriorityBadge priority={lead.priority} />
              <StageBadge stage={lead.stage} />
            </div>

            <div className="grid divide-y divide-white/[0.055] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="px-5 py-4">
                <p className="text-[8px] font-semibold uppercase tracking-[.14em] text-zinc-600">Valor potencial</p>
                <p className="tabular mt-2 text-[22px] font-semibold tracking-[-0.035em] text-white">{formatCurrency(lead.potentialValue)}</p>
              </div>
              <div className="px-5 py-4">
                <p className="text-[8px] font-semibold uppercase tracking-[.14em] text-zinc-600">Último contato</p>
                <p className="mt-2 text-[11px] font-semibold text-zinc-300">{formatDate(lead.lastContact)}</p>
              </div>
            </div>

            <div className="space-y-3 border-t border-white/[0.055] px-5 py-4 text-[10px] text-zinc-500">
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

            <div className="border-t border-white/[0.055] bg-[#0b0e12] px-5 py-4">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[.14em] text-emerald-300">Contato direto</p>
                  <p className="mt-1.5 max-w-3xl text-[10px] leading-5 text-zinc-500">
                    {whatsappLink
                      ? whatsappMessage
                      : 'Este lead não possui telefone disponível para abrir uma conversa no WhatsApp.'}
                  </p>
                </div>
                <Button
                  variant={whatsappLink ? 'success' : 'secondary'}
                  className="w-full lg:w-auto"
                  onClick={openWhatsApp}
                  disabled={!whatsappLink}
                >
                  <MessageCircle className="size-4" />
                  {whatsappLink ? 'Abrir WhatsApp' : 'WhatsApp indisponível'}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/[0.055] px-5 py-4 sm:flex-row sm:items-center">
              <div className="flex flex-1 flex-wrap gap-2">
                <Button variant="outline" onClick={() => window.open(mapsUrl(lead.name, lead.address), '_blank', 'noopener,noreferrer')}>
                  <MapPin className="size-4" />
                  Google Maps
                </Button>
                {lead.website ? (
                  <Button variant="outline" onClick={() => window.open(lead.website, '_blank', 'noopener,noreferrer')}>
                    <ExternalLink className="size-4" />
                    Site atual
                  </Button>
                ) : null}
                <Button
                  variant="secondary"
                  onClick={() => moveLeadStage(lead.id, lead.stage === 'novo' ? 'contatado' : lead.stage === 'contatado' ? 'proposta' : 'fechado')}
                >
                  <ArrowRight className="size-4" />
                  Avançar estágio
                </Button>
              </div>

              <Button
                variant="ghost"
                className="self-start text-zinc-600 hover:bg-red-400/[0.06] hover:text-red-300 sm:ml-auto sm:self-auto"
                onClick={() => {
                  if (confirm(`Excluir ${lead.name}?`)) {
                    removeLead(lead.id)
                    navigate('/leads')
                  }
                }}
              >
                <Trash2 className="size-4" />
                Excluir
              </Button>
            </div>
          </Card>

          <Card className="p-0">
            <div className="border-b border-white/[0.055] px-5 py-4">
              <p className="text-[12px] font-semibold text-white">Histórico de atividades</p>
              <p className="mt-1 text-[9px] text-zinc-600">Registro cronológico das ações do lead.</p>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {lead.activities.slice().reverse().map((activity) => (
                <div key={activity.id} className="flex items-start justify-between gap-4 px-5 py-3.5">
                  <p className="text-[10px] leading-5 text-zinc-400">{activity.description}</p>
                  <p className="shrink-0 text-[8px] text-zinc-700">{formatDate(activity.createdAt)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          <Card>
            <p className="text-[12px] font-semibold text-white">Notas comerciais</p>
            <p className="mt-1 text-[9px] text-zinc-600">Contexto útil para abordagem e follow-up.</p>
            <Textarea className="mt-4 min-h-40" value={lead.notes} onChange={(event) => patchLead(lead.id, { notes: event.target.value })} />
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold text-white">Prompt salvo</p>
                <p className="mt-1 text-[9px] text-zinc-600">Briefing de website vinculado a este lead.</p>
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
