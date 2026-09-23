import type { LeadStage } from '../types'

const base = 'inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-semibold tracking-[.02em]'

export function StageBadge({ stage }: { stage: LeadStage }) {
  const map = {
    novo: 'border-white/[0.085] bg-white/[0.04] text-zinc-400',
    contatado: 'border-sky-400/15 bg-sky-400/[0.075] text-sky-300',
    proposta: 'border-violet-400/15 bg-violet-400/[0.075] text-violet-300',
    fechado: 'border-emerald-400/15 bg-emerald-400/[0.075] text-emerald-300',
  }
  const labels = { novo: 'Novo', contatado: 'Contatado', proposta: 'Proposta', fechado: 'Fechado' }
  return <span className={`${base} ${map[stage]}`}>{labels[stage]}</span>
}

export function PriorityBadge({ priority }: { priority: number }) {
  const cls = priority >= 80
    ? 'border-emerald-400/15 bg-emerald-400/[0.075] text-emerald-300'
    : priority >= 60
      ? 'border-amber-400/15 bg-amber-400/[0.075] text-amber-300'
      : 'border-white/[0.08] bg-white/[0.035] text-zinc-500'
  return <span className={`${base} tabular ${cls}`}>{priority} pts</span>
}

export function WebsiteBadge({ hasWebsite }: { hasWebsite: boolean }) {
  return hasWebsite ? (
    <span className={`${base} border-white/[0.08] bg-white/[0.035] text-zinc-500`}>Com site</span>
  ) : (
    <span className={`${base} border-amber-400/18 bg-amber-400/[0.075] uppercase tracking-[.08em] text-amber-300`}>Sem site</span>
  )
}
