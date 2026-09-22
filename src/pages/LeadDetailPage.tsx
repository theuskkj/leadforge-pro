import { Clipboard, ExternalLink, PhoneCall, Trash2, WandSparkles } from 'lucide-react'
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
        title={lead.name}
        subtitle={`${lead.niche} • ${lead.city}`}
        actions={
          <>
            <Button variant="secondary" onClick={() => { patchLead(lead.id, { lastContact: new Date().toISOString() }); toast.success('Contato marcado') }}>
              <PhoneCall className="mr-1 h-4 w-4" />Marcar contato
            </Button>
            <Link to="/prompt-generator" state={{ prefill: { companyName: lead.name, niche: lead.niche, city: lead.city, description: lead.notes, targetAudience: '', services: lead.niche, siteGoal: 'Converter visitantes em leads', visualStyle: 'Premium', colors: '#070708 #ff2438', cta: 'Solicitar orçamento' } }}>
              <Button><WandSparkles className="mr-1 h-4 w-4" />Gerar prompt</Button>
            </Link>
          </>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            <WebsiteBadge hasWebsite={Boolean(lead.website)} />
            <PriorityBadge priority={lead.priority} />
            <StageBadge stage={lead.stage} />
          </div>
          <div className="mt-3 space-y-2 text-sm text-zinc-300">
            <p>Endereço: {lead.address}</p>
            <p>Telefone: {lead.phone ?? '—'}</p>
            <p>Site: {lead.website ? <a className="text-[#ff3b45]" href={lead.website} target="_blank" rel="noreferrer">{lead.website}</a> : '—'}</p>
            <p>Avaliação: {lead.rating} ({lead.reviewCount} avaliações)</p>
            <p>Valor potencial: {formatCurrency(lead.potentialValue)}</p>
            <p>Último contato: {formatDate(lead.lastContact)}</p>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            <Button variant="outline" onClick={() => window.open(mapsUrl(lead.name, lead.address), '_blank')}><ExternalLink className="mr-1 h-4 w-4" />Google Maps</Button>
            <Button variant="outline" onClick={() => moveLeadStage(lead.id, lead.stage === 'novo' ? 'contatado' : lead.stage === 'contatado' ? 'proposta' : 'fechado')}>
              Avançar estágio
            </Button>
            <Button variant="secondary" onClick={async () => {
              await navigator.clipboard.writeText(lead.prompt ?? '')
              toast.success('Prompt copiado')
            }}><Clipboard className="mr-1 h-4 w-4" />Copiar prompt</Button>
            <Button variant="ghost" onClick={() => {
              if (confirm(`Excluir ${lead.name}?`)) {
                removeLead(lead.id)
                navigate('/leads')
              }
            }}><Trash2 className="mr-1 h-4 w-4" />Excluir</Button>
          </div>
        </Card>
        <Card>
          <h3 className="mb-2 text-lg text-white">Notas</h3>
          <Textarea value={lead.notes} onChange={(e) => patchLead(lead.id, { notes: e.target.value })} />
          <h3 className="mb-2 mt-4 text-lg text-white">Prompt salvo</h3>
          <Textarea value={lead.prompt ?? ''} onChange={(e) => patchLead(lead.id, { prompt: e.target.value })} />
        </Card>
      </div>
      <Card className="mt-4">
        <h3 className="mb-3 text-lg text-white">Histórico de atividades</h3>
        <ul className="space-y-2 text-sm text-zinc-300">
          {lead.activities.slice().reverse().map((activity) => (
            <li key={activity.id} className="rounded-2xl border border-zinc-800 p-3">
              <p>{activity.description}</p>
              <p className="text-xs text-zinc-500">{formatDate(activity.createdAt)}</p>
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
}
