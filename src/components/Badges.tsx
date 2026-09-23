import type { LeadStage } from '../types'

const base = 'inline-flex items-center rounded-[6px] border px-2 py-1 text-[9px] font-semibold tracking-[.02em]'

export function StageBadge({ stage }: { stage: LeadStage }) {
  const map = {
    novo: 'border-[#2a313a] bg-[#15191f] text-zinc-400',
    contatado: 'border-sky-400/20 bg-sky-400/[0.07] text-sky-300',
    proposta: 'border-violet-400/20 bg-violet-400/[0.07] text-violet-300',
    fechado: 'border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300',
  }
  const labels = { novo: 'Novo', contatado: 'Contatado', proposta: 'Proposta', fechado: 'Fechado' }
  return <span className={`${base} ${map[stage]}`}>{labels[stage]}</span>
}

export function PriorityBadge({ priority }: { priority: number }) {
  const cls = priority >= 80
    ? 'border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300'
    : priority >= 60
      ? 'border-amber-400/20 bg-amber-400/[0.07] text-amber-300'
      : 'border-[#2a313a] bg-[#15191f] text-zinc-500'
  return <span className={`${base} tabular ${cls}`}>{priority} pts</span>
}

export function WebsiteBadge({ hasWebsite }: { hasWebsite: boolean }) {
  return hasWebsite ? (
    <span className={`${base} border-[#2a313a] bg-[#15191f] text-zinc-500`}>Com site</span>
  ) : (
    <span className={`${base} border-amber-400/20 bg-amber-400/[0.07] uppercase tracking-[.08em] text-amber-300`}>Sem site</span>
  )
}
