import { ArrowRight, Banknote, Circle } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { PriorityBadge } from '../components/Badges'
import { Card } from '../components/ui/card'
import { Select } from '../components/ui/select'
import { useAppData } from '../hooks/useAppData'
import { formatCurrency, initials } from '../lib/utils'
import type { LeadStage } from '../types'

const columns: LeadStage[] = ['novo', 'contatado', 'proposta', 'fechado']
const labels: Record<LeadStage, string> = { novo: 'Novos', contatado: 'Contatados', proposta: 'Propostas', fechado: 'Fechados' }
const dotClass: Record<LeadStage, string> = {
  novo: 'text-zinc-500',
  contatado: 'text-sky-400',
  proposta: 'text-violet-400',
  fechado: 'text-emerald-400',
}

export function PipelinePage() {
  const { leads, moveLeadStage } = useAppData()
  const totalPipeline = leads.reduce((sum, lead) => sum + lead.potentialValue, 0)

  return (
    <>
      <PageHeader
        eyebrow="CRM / Pipeline"
        title="Pipeline comercial"
        subtitle="Uma visão compacta do avanço das oportunidades, valor potencial e próximos movimentos."
        actions={
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-2 text-right">
            <p className="text-[9px] uppercase tracking-[.14em] text-zinc-600">Valor total</p>
            <p className="tabular mt-1 text-sm font-semibold text-zinc-200">{formatCurrency(totalPipeline)}</p>
          </div>
        }
      />

      <div className="grid gap-3 xl:grid-cols-4">
        {columns.map((stage) => {
          const stageLeads = leads.filter((lead) => lead.stage === stage)
          const total = stageLeads.reduce((sum, lead) => sum + lead.potentialValue, 0)

          return (
            <Card key={stage} className="min-h-[470px] bg-[#0c0f14]/96 p-3.5">
              <div className="mb-3 flex items-start justify-between rounded-xl border border-white/[0.055] bg-white/[0.02] px-3 py-3">
                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                    <Circle className={`size-2 fill-current ${dotClass[stage]}`} />
                    {labels[stage]}
                  </p>
                  <p className="mt-1.5 text-[10px] text-zinc-600">{stageLeads.length} oportunidades</p>
                </div>
                <div className="text-right">
                  <p className="tabular text-xs font-semibold text-zinc-300">{formatCurrency(total)}</p>
                  <p className="mt-1 text-[8px] uppercase tracking-[.13em] text-zinc-700">pipeline</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {stageLeads.map((lead) => (
                  <div key={lead.id} className="pro-card-hover rounded-xl border border-white/[0.065] bg-[#11151c] p-3.5">
                    <div className="flex items-start gap-2.5">
                      <div className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.035] text-[9px] font-semibold text-zinc-400">
                        {initials(lead.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-zinc-200">{lead.name}</p>
                        <p className="mt-1 truncate text-[9px] text-zinc-600">{lead.niche}</p>
                      </div>
                      <PriorityBadge priority={lead.priority} />
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-3">
                      <span className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                        <Banknote className="size-3" />
                        {formatCurrency(lead.potentialValue)}
                      </span>
                      <ArrowRight className="size-3.5 text-zinc-700" />
                    </div>

                    <Select
                      className="mt-3 h-9 text-[10px]"
                      value={lead.stage}
                      onChange={(event) => {
                        const next = event.target.value as LeadStage
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
                  <div className="rounded-xl border border-dashed border-white/[0.07] px-3 py-10 text-center">
                    <p className="text-[10px] font-medium text-zinc-600">Nenhuma oportunidade</p>
                    <p className="mt-1 text-[9px] text-zinc-700">Mova um lead para este estágio.</p>
                  </div>
                ) : null}
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}
