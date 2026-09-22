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
import { ArrowUpRight, Banknote, Contact, Radar, Target, TrendingUp, WandSparkles } from 'lucide-react'
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
    <Card className="pro-card-hover min-h-[154px]">
      <div className="flex items-start justify-between">
        <div className={`grid size-9 place-items-center rounded-xl border ${accent ? 'border-[#ff2438]/20 bg-[#ff2438]/10 text-[#ff5668]' : 'border-white/[0.07] bg-white/[0.035] text-zinc-400'}`}>
          <Icon className="size-[17px]" />
        </div>
        <ArrowUpRight className="size-4 text-zinc-700" />
      </div>
      <p className="mt-5 text-[11px] font-medium uppercase tracking-[.12em] text-zinc-600">{label}</p>
      <p className="tabular mt-1.5 text-[25px] font-semibold tracking-[-0.04em] text-white">{value}</p>
      <p className="mt-2 text-xs text-zinc-500">{caption}</p>
    </Card>
  )
}

export function DashboardPage() {
  const { leads } = useAppData()
  const revenue = leads.filter((lead) => lead.stage !== 'fechado').reduce((sum, lead) => sum + lead.potentialValue, 0)
  const contacted = leads.filter((lead) => lead.stage !== 'novo').length
  const advanceRate = leads.length ? Math.round((contacted / leads.length) * 100) : 0
  const noWebsite = leads.filter((lead) => !lead.website).length
  const priorityLeads = [...leads].sort((a, b) => b.priority - a.priority).slice(0, 5)

  const stageData = (['novo', 'contatado', 'proposta', 'fechado'] as const).map((stage) => ({
    stage: stageLabels[stage],
    total: leads.filter((lead) => lead.stage === stage).length,
  }))

  const now = new Date()
  const trendData = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(now)
    date.setDate(now.getDate() - (6 - index))
    const day = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
    const count = leads.filter((lead) => {
      const created = new Date(lead.createdAt)
      return created.toDateString() === date.toDateString()
    }).length
    return { day, leads: count }
  })

  return (
    <>
      <PageHeader
        eyebrow="Visão geral"
        title="Sua operação, em um só lugar."
        subtitle="Acompanhe oportunidades, avanço comercial e receita potencial sem perder os leads mais valiosos."
        actions={
          <>
            <Link to="/prompt-generator"><Button variant="outline"><WandSparkles className="size-4" />Gerar prompt</Button></Link>
            <Link to="/radar"><Button><Radar className="size-4" />Novo radar</Button></Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Leads no radar" value={String(leads.length)} caption={`${noWebsite} oportunidades sem site`} icon={Radar} accent />
        <MetricCard label="Receita potencial" value={formatCurrency(revenue)} caption="Pipeline em aberto" icon={Banknote} />
        <MetricCard label="Contatos iniciados" value={String(contacted)} caption={`${leads.length - contacted} aguardando abordagem`} icon={Contact} />
        <MetricCard label="Taxa de avanço" value={`${advanceRate}%`} caption="Leads além do estágio inicial" icon={Target} />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1.35fr_.9fr]">
        <Card className="min-h-[360px]">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-[15px] font-semibold text-white">Evolução de leads</p>
              <p className="mt-1 text-xs text-zinc-500">Novas oportunidades nos últimos 7 dias</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-2.5 py-1 text-[10px] font-medium text-emerald-300">
              <TrendingUp className="size-3" /> Dados reais
            </span>
          </div>
          <div className="h-[265px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ left: -20, right: 4 }}>
                <defs>
                  <linearGradient id="leadArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff2438" stopOpacity={0.26} />
                    <stop offset="100%" stopColor="#ff2438" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,.045)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#666a73', fontSize: 11 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#666a73', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#111216', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, fontSize: 12 }}
                  cursor={{ stroke: 'rgba(255,36,56,.18)' }}
                />
                <Area type="monotone" dataKey="leads" stroke="#ff2438" strokeWidth={2.2} fill="url(#leadArea)" dot={false} activeDot={{ r: 4, fill: '#ff2438', stroke: '#111216', strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="mb-5">
            <p className="text-[15px] font-semibold text-white">Pipeline comercial</p>
            <p className="mt-1 text-xs text-zinc-500">Distribuição por estágio</p>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ left: -24 }}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,.04)" />
                <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{ fill: '#666a73', fontSize: 10 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#666a73', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#111216', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, fontSize: 12 }} cursor={false} />
                <Bar dataKey="total" fill="#ff2438" radius={[7, 7, 2, 2]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {stageData.map((item) => (
              <div key={item.stage} className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2">
                <p className="text-[10px] text-zinc-600">{item.stage}</p>
                <p className="tabular mt-1 text-sm font-semibold text-zinc-200">{item.total}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-3">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[15px] font-semibold text-white">Leads prioritários</p>
            <p className="mt-1 text-xs text-zinc-500">Oportunidades que merecem atenção primeiro</p>
          </div>
          <Link to="/leads" className="text-xs font-medium text-[#ff5668] hover:text-[#ff7685]">Ver todos</Link>
        </div>
        <div className="divide-y divide-white/[0.055]">
          {priorityLeads.map((lead) => (
            <Link key={lead.id} to={`/lead/${lead.id}`} className="group flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
              <div className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-[11px] font-semibold text-zinc-300">
                {initials(lead.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-100 group-hover:text-white">{lead.name}</p>
                <p className="mt-0.5 truncate text-[11px] text-zinc-600">{lead.niche} · {lead.city}</p>
              </div>
              <div className="hidden sm:block"><StageBadge stage={lead.stage} /></div>
              <PriorityBadge priority={lead.priority} />
              <ArrowUpRight className="size-4 text-zinc-700 transition group-hover:text-zinc-400" />
            </Link>
          ))}
        </div>
      </Card>
    </>
  )
}
