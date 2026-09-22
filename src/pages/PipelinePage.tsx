import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { useAppData } from '../hooks/useAppData'
import { formatCurrency } from '../lib/utils'
import type { LeadStage } from '../types'

const columns: LeadStage[] = ['novo', 'contatado', 'proposta', 'fechado']

export function PipelinePage() {
  const { leads, moveLeadStage } = useAppData()

  return (
    <>
      <PageHeader title="Funil comercial" subtitle="Acompanhe a evolução dos leads" />
      <div className="grid gap-3 xl:grid-cols-4">
        {columns.map((stage) => (
          <Card key={stage}>
            <h3 className="mb-3 text-lg font-medium capitalize text-white">{stage}</h3>
            <div className="space-y-2">
              {leads.filter((lead) => lead.stage === stage).map((lead) => (
                <div key={lead.id} className="rounded-2xl border border-zinc-800 bg-[#1a1a1d] p-3">
                  <p className="font-medium text-white">{lead.name}</p>
                  <p className="text-xs text-zinc-400">{formatCurrency(lead.potentialValue)}</p>
                  <div className="mt-2 space-y-2">
                    <Select
                      value={lead.stage}
                      onChange={(e) => {
                        const next = e.target.value as LeadStage
                        if (next === 'fechado') {
                          const value = prompt('Valor fechado (R$):', String(lead.potentialValue))
                          moveLeadStage(lead.id, next, value ? Number(value) : lead.potentialValue)
                          return
                        }
                        moveLeadStage(lead.id, next)
                      }}
                    >
                      {columns.map((item) => <option key={item} value={item}>{item}</option>)}
                    </Select>
                    {lead.stage === 'fechado' ? <Input value={lead.potentialValue} type="number" onChange={(e) => moveLeadStage(lead.id, 'fechado', Number(e.target.value))} /> : null}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}
