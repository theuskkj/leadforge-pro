import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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
  TrendingUp,
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

function MetricCard({
  label,
  value,
  caption,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  caption: string
  icon: typeof Radar
  accent?: boolean
}) {
  return (
    <Card className={`metric-glow pro-card-hover min-h-[148px] p-5 ${accent ? 'border-[#ff304d]/15' : ''}`}>
      <div className="flex items-start justify-between">
        <span className={`grid size-9 place-items-center rounded-xl border ${
          accent
            ? 'border-[#ff304d]/20 bg-[#ff304d]/[0.08] text-[#ff6378]'
            : 'border-white/[0.07] bg-white/[0.03] text-zinc-500'
        }`}>
          <Icon className="size-4" />
        </span>
        <ArrowUpRight className="size-3.5 text-zinc-700" />
      </div>
      <p className="mt-5 text-[9px] font-semibold uppercase tracking-[.15em] text-zinc-600">{label}</p>
      <p className="tabular mt-1.5 text-[26px] font-semibold tracking-[-0.045em] text-zinc-100">{value}</p>
      <p className="mt-2 text-[10px] text-zinc-600">{caption}</p>
    </Card>
  )
}

export function DashboardPage() {
  const { leads } = useAppData()
  const revenue = leads.filter((lead) => lead.stage !== 'fechado').reduce((sum, lead) => sum + lead.potentialValue, 0)
  const contacted = leads.filter((lead) => lead.stage !== 'novo').length
  const advanceRate = leads.length ? Math.round((contacted / leads.length) * 100) : 0
  const noWebsite = leads.filter((lead) => !lead.website).length
  const priorityLeads = [...leads].sort((a, b) => b.priority - a.priority).slice(0, 6)

  const stageData = (['novo', 'contatado', 'proposta', 'fechado'] as const).map((stage) => ({
    stage: stageLabels[stage],
    total: leads.filter((lead) => lead.stage === stage).length,
  }))

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
        subtitle="Leads, pipeline e criação de propostas em uma visão objetiva para decidir o próximo movimento comercial."
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Base de leads" value={String(leads.length)} caption={`${noWebsite} sem website identificado`} icon={Radar} accent />
        <MetricCard label="Pipeline aberto" value={formatCurrency(revenue)} caption="Valor potencial não fechado" icon={Banknote} />
        <MetricCard label="Contatos iniciados" value={String(contacted)} caption={`${Math.max(0, leads.length - contacted)} aguardando abordagem`} icon={Contact} />
        <MetricCard label="Taxa de avanço" value={`${advanceRate}%`} caption="Leads além do estágio inicial" icon={Target} />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1.35fr_.9fr]">
        <Card className="min-h-[370px]">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-[13px] font-semibold text-zinc-100">Aquisição de leads</p>
              <p className="mt-1 text-[10px] text-zinc-600">Novas oportunidades adicionadas nos últimos 7 dias</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2.5 py-1 text-[9px] font-semibold text-emerald-300">
              <TrendingUp className="size-3" />
              Dados reais
            </span>
          </div>

          <div className="h-[275px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ left: -20, right: 4 }}>
                <defs>
                  <linearGradient id="leadAreaV2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff304d" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#ff304d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,.035)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#5f6879', fontSize: 10 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#5f6879', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, fontSize: 11 }}
                  cursor={{ stroke: 'rgba(255,48,77,.15)' }}
                />
                <Area type="monotone" dataKey="leads" stroke="#ff304d" strokeWidth={2} fill="url(#leadAreaV2)" dot={false} activeDot={{ r: 4, fill: '#ff304d', stroke: '#0d1117', strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="mb-5">
            <p className="text-[13px] font-semibold text-zinc-100">Distribuição do pipeline</p>
            <p className="mt-1 text-[10px] text-zinc-600">Quantidade de leads por estágio</p>
          </div>

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ left: -24 }}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,.03)" />
                <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{ fill: '#5f6879', fontSize: 9 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#5f6879', fontSize: 9 }} />
                <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, fontSize: 11 }} cursor={false} />
                <Bar dataKey="total" fill="#ff304d" radius={[6, 6, 2, 2]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {stageData.map((item) => (
              <div key={item.stage} className="rounded-xl border border-white/[0.055] bg-white/[0.02] px-3 py-2.5">
                <p className="text-[9px] text-zinc-600">{item.stage}</p>
                <p className="tabular mt-1 text-sm font-semibold text-zinc-300">{item.total}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-3">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold text-zinc-100">Fila de prioridade</p>
            <p className="mt-1 text-[10px] text-zinc-600">Oportunidades com maior score para ação comercial</p>
          </div>
          <Link to="/leads" className="text-[10px] font-semibold text-[#ff6378] transition hover:text-[#ff8292]">Ver base completa</Link>
        </div>

        {priorityLeads.length ? (
          <div className="divide-y divide-white/[0.05]">
            {priorityLeads.map((lead) => (
              <Link key={lead.id} to={`/lead/${lead.id}`} className="group flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.035] text-[10px] font-semibold text-zinc-400">
                  {initials(lead.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-zinc-200 group-hover:text-white">{lead.name}</p>
                  <p className="mt-1 truncate text-[9px] text-zinc-600">{lead.niche} · {lead.city}</p>
                </div>
                <div className="hidden sm:block"><StageBadge stage={lead.stage} /></div>
                <PriorityBadge priority={lead.priority} />
                <ArrowUpRight className="size-3.5 text-zinc-700 transition group-hover:text-zinc-400" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/[0.07] py-10 text-center text-[10px] text-zinc-600">
            Nenhum lead salvo ainda. Use o Radar para começar.
          </div>
        )}
      </Card>
    </>
  )
}
