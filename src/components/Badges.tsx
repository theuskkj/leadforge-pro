import type { LeadStage } from '../types'

export function StageBadge({ stage }: { stage: LeadStage }) {
  const map = {
    novo: 'bg-zinc-700 text-zinc-100',
    contatado: 'bg-blue-900/60 text-blue-200',
    proposta: 'bg-purple-900/60 text-purple-200',
    fechado: 'bg-emerald-900/60 text-emerald-200',
  }
  return <span className={`rounded-full px-3 py-1 text-xs ${map[stage]}`}>{stage}</span>
}

export function PriorityBadge({ priority }: { priority: number }) {
  const cls = priority >= 80 ? 'bg-emerald-900/60 text-emerald-200' : priority >= 60 ? 'bg-amber-900/60 text-amber-200' : 'bg-zinc-700 text-zinc-200'
  return <span className={`rounded-full px-3 py-1 text-xs ${cls}`}>Prioridade {priority}</span>
}

export function WebsiteBadge({ hasWebsite }: { hasWebsite: boolean }) {
  return hasWebsite ? (
    <span className="rounded-full bg-zinc-700 px-3 py-1 text-xs text-zinc-200">Com site</span>
  ) : (
    <span className="rounded-full bg-amber-900/70 px-3 py-1 text-xs text-amber-200">Sem site</span>
  )
}
