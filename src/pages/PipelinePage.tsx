import { ArrowRight, Banknote } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { PriorityBadge } from '../components/Badges'
import { Card } from '../components/ui/card'
import { Select } from '../components/ui/select'
import { useAppData } from '../hooks/useAppData'
import { formatCurrency, initials } from '../lib/utils'
import type { LeadStage } from '../types'

const columns: LeadStage[] = ['novo', 'contatado', 'proposta', 'fechado']
const labels: Record<LeadStage, string> = { novo: 'Novo', contatado: 'Contatado', proposta: 'Proposta', fechado: 'Fechado' }

export function PipelinePage() {
  const { leads, moveLeadStage } = useAppData()

  return (
    <>
      <PageHeader eyebrow="Pipeline" title="Funil comercial" subtitle="Acompanhe o avanço de cada oportunidade e mantenha o valor do pipeline visível." />
      <div className="grid gap-3 xl:grid-cols-4">
        {columns.map((stage) => {
          const stageLeads = leads.filter((lead) => lead.stage === stage)
          const total = stageLeads.reduce((sum, lead) => sum + lead.potentialValue, 0)
          return (
            <Card key={stage} className="min-h-[420px] bg-[#0f1013]/95 p-3.5">
              <div className="mb-3 flex items-start justify-between border-b border-white/[0.055] px-1 pb-3">
                <div>
                  <p className="text-xs font-semibold text-zinc-200">{labels[stage]}</p>
                  <p className="mt-1 text-[10px] text-zinc-600">{stageLeads.length} leads</p>
                </div>
                <div className="text-right">
                  <p className="tabular text-xs font-medium text-zinc-300">{formatCurrency(total)}</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[.1em] text-zinc-700">pipeline</p>
                </div>
              </div>

              <div className="space-y-2">
                {stageLeads.map((lead) => (
                  <div key={lead.id} className="pro-card-hover rounded-2xl border border-white/[0.065] bg-[#15161a] p-3.5">
                    <div className="flex items-start gap-2.5">
                      <div className="grid size-8 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-[9px] font-semibold text-zinc-400">{initials(lead.name)}</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-zinc-200">{lead.name}</p>
                        <p className="mt-1 truncate text-[10px] text-zinc-600">{lead.niche}</p>
                      </div>
                      <PriorityBadge priority={lead.priority} />
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-3">
                      <span className="flex items-center gap-1.5 text-[10px] text-zinc-500"><Banknote className="size-3" />{formatCurrency(lead.potentialValue)}</span>
                      <ArrowRight className="size-3.5 text-zinc-700" />
                    </div>

                    <Select
                      className="mt-3 h-9 text-xs"
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
                      {columns.map((item) => <option key={item} value={item}>{labels[item]}</option>)}
                    </Select>
                  </div>
                ))}

                {stageLeads.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/[0.07] px-3 py-8 text-center text-[10px] text-zinc-700">Nenhum lead neste estágio</div>
                ) : null}
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}
