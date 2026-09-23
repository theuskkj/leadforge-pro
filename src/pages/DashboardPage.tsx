import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowUpRight,
  Banknote,
  Contact,
  Radar,
  Target,
  WandSparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PriorityBadge, StageBadge } from '../components/Badges'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { useAppData } from '../hooks/useAppData'
import { formatCurrency, initials } from '../lib/utils'

const stageLabels = {
  novo: 'Novos',
  contatado: 'Contatados',
  proposta: 'Propostas',
  fechado: 'Fechados',
} as const

const metricIcons = [Radar, Banknote, Contact, Target]

export function DashboardPage() {
  const { leads } = useAppData()
  const revenue = leads.filter((lead) => lead.stage !== 'fechado').reduce((sum, lead) => sum + lead.potentialValue, 0)
  const contacted = leads.filter((lead) => lead.stage !== 'novo').length
  const advanceRate = leads.length ? Math.round((contacted / leads.length) * 100) : 0
  const noWebsite = leads.filter((lead) => !lead.website).length
  const priorityLeads = [...leads].sort((a, b) => b.priority - a.priority).slice(0, 6)

  const metrics = [
    { label: 'Base de leads', value: String(leads.length), caption: `${noWebsite} sem website identificado` },
    { label: 'Pipeline aberto', value: formatCurrency(revenue), caption: 'Valor potencial não fechado' },
    { label: 'Contatos iniciados', value: String(contacted), caption: `${Math.max(0, leads.length - contacted)} aguardando abordagem` },
    { label: 'Taxa de avanço', value: `${advanceRate}%`, caption: 'Leads além do estágio inicial' },
  ]

  const stageData = (['novo', 'contatado', 'proposta', 'fechado'] as const).map((stage) => ({
    stage,
    label: stageLabels[stage],
    total: leads.filter((lead) => lead.stage === stage).length,
  }))
  const maxStage = Math.max(1, ...stageData.map((item) => item.total))

  const now = new Date()
  const trendData = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(now)
    date.setDate(now.getDate() - (6 - index))
    const day = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
    const count = leads.filter((lead) => new Date(lead.createdAt).toDateString() === date.toDateString()).length
    return { day, leads: count }
  })

  return (
    <>
      <PageHeader
        eyebrow="Command center"
        title="Painel de operação"
        subtitle="Veja o que exige ação agora, acompanhe o funil e avance as melhores oportunidades."
        actions={
          <>
            <Link to="/prompt-generator">
              <Button variant="outline"><WandSparkles className="size-4" />Prompt Studio</Button>
            </Link>
            <Link to="/radar">
              <Button><Radar className="size-4" />Abrir radar</Button>
            </Link>
          </>
        }
      />

      <Card className="overflow-hidden p-0">
        <div className="grid divide-y divide-white/[0.055] sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
          {metrics.map((metric, index) => {
            const Icon = metricIcons[index]
            return (
              <div key={metric.label} className="min-w-0 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[8px] font-semibold uppercase tracking-[.15em] text-zinc-600">{metric.label}</p>
                  <Icon className={`size-3.5 ${index === 0 ? 'text-[#ef5269]' : 'text-zinc-700'}`} />
                </div>
                <p className="tabular mt-3 truncate text-[24px] font-semibold tracking-[-0.04em] text-zinc-100">{metric.value}</p>
                <p className="mt-1.5 text-[9px] leading-4 text-zinc-600">{metric.caption}</p>
              </div>
            )
          })}
        </div>
      </Card>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1.25fr_.75fr]">
        <Card className="min-h-[388px]">
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="min-w-0 flex-1">
              <div className="mb-5">
                <p className="text-[12px] font-semibold text-zinc-100">Aquisição nos últimos 7 dias</p>
                <p className="mt-1 text-[9px] text-zinc-600">Novos leads adicionados à base por dia</p>
              </div>
              <div className="h-[245px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ left: -20, right: 4 }}>
                    <defs>
                      <linearGradient id="leadAreaOperational" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d92d46" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#d92d46" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,.035)" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6c7583', fontSize: 9 }} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#6c7583', fontSize: 9 }} />
                    <Tooltip
                      contentStyle={{ background: '#0d1014', border: '1px solid #2a313a', borderRadius: 9, fontSize: 10 }}
                      cursor={{ stroke: 'rgba(217,45,70,.16)' }}
                    />
                    <Area type="monotone" dataKey="leads" stroke="#d92d46" strokeWidth={2} fill="url(#leadAreaOperational)" dot={false} activeDot={{ r: 4, fill: '#d92d46', stroke: '#08090c', strokeWidth: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="w-full border-t border-white/[0.055] pt-5 lg:w-[240px] lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
              <p className="text-[8px] font-semibold uppercase tracking-[.14em] text-zinc-600">Pipeline por estágio</p>
              <div className="mt-4 space-y-4">
                {stageData.map((item) => (
                  <div key={item.stage}>
                    <div className="flex items-center justify-between gap-3 text-[10px]">
                      <span className="text-zinc-500">{item.label}</span>
                      <span className="tabular font-semibold text-zinc-300">{item.total}</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
                      <div
                        className="h-full rounded-full bg-[#d92d46]"
                        style={{ width: `${Math.max(4, (item.total / maxStage) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-0">
          <div className="border-b border-white/[0.055] px-5 py-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold text-zinc-100">Fila de prioridade</p>
                <p className="mt-1 text-[9px] text-zinc-600">Próximas oportunidades para abordagem</p>
              </div>
              <Link to="/leads" className="text-[9px] font-semibold text-[#ef5269] hover:text-[#ff7588]">Ver base</Link>
            </div>
          </div>

          {priorityLeads.length ? (
            <div className="divide-y divide-white/[0.05]">
              {priorityLeads.map((lead) => (
                <Link key={lead.id} to={`/lead/${lead.id}`} className="group flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.018]">
                  <div className="grid size-8 shrink-0 place-items-center rounded-[8px] border border-[#2a313a] bg-[#14181e] text-[9px] font-semibold text-zinc-400">
                    {initials(lead.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-zinc-200 group-hover:text-white">{lead.name}</p>
                    <p className="mt-1 truncate text-[8px] text-zinc-600">{lead.niche} · {lead.city}</p>
                  </div>
                  <div className="hidden sm:block"><StageBadge stage={lead.stage} /></div>
                  <PriorityBadge priority={lead.priority} />
                  <ArrowUpRight className="size-3.5 text-zinc-700 group-hover:text-zinc-400" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <p className="text-[10px] font-medium text-zinc-500">Nenhum lead salvo ainda.</p>
              <p className="mt-1 text-[9px] text-zinc-700">Abra o Radar para iniciar sua fila de prospecção.</p>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
