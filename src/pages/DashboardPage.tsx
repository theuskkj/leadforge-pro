import { BarChart, Bar, ResponsiveContainer, Tooltip } from 'recharts'
import { Link } from 'react-router-dom'
import { PriorityBadge, StageBadge } from '../components/Badges'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { useAppData } from '../hooks/useAppData'
import { formatCurrency } from '../lib/utils'

export function DashboardPage() {
  const { leads } = useAppData()
  const revenue = leads.reduce((sum, lead) => sum + lead.potentialValue, 0)
  const contacted = leads.filter((lead) => lead.stage !== 'novo').length
  const advanceRate = leads.length ? Math.round((contacted / leads.length) * 100) : 0
  const stageData = ['novo', 'contatado', 'proposta', 'fechado'].map((stage) => ({
    stage,
    total: leads.filter((lead) => lead.stage === stage).length,
  }))
  const priorityLeads = [...leads].sort((a, b) => b.priority - a.priority).slice(0, 5)

  return (
    <>
      <PageHeader
        title="Olá, equipe LeadForge 👋"
        subtitle="Visão geral do seu radar comercial"
        actions={
          <>
            <Link to="/radar"><Button>Novo radar</Button></Link>
            <Button variant="outline">Gerar link</Button>
          </>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Leads no radar', String(leads.length)],
          ['Receita potencial', formatCurrency(revenue)],
          ['Contatos iniciados', String(contacted)],
          ['Taxa de avanço', `${advanceRate}%`],
        ].map(([label, value]) => (
          <Card key={label}>
            <p className="text-sm text-zinc-400">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          </Card>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-lg font-medium text-white">Resumo do funil</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData}>
                <Bar dataKey="total" fill="#ff2438" radius={[8, 8, 0, 0]} />
                <Tooltip cursor={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="mb-4 text-lg font-medium text-white">Leads prioritários</h3>
          <div className="space-y-3">
            {priorityLeads.map((lead) => (
              <div key={lead.id} className="rounded-2xl border border-zinc-800 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-white">{lead.name}</p>
                  <PriorityBadge priority={lead.priority} />
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-zinc-400">
                  <span>{lead.niche}</span>
                  <StageBadge stage={lead.stage} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
