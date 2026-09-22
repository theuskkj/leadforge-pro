import type { LeadStage } from '../types'

export function StageBadge({ stage }: { stage: LeadStage }) {
  const map = {
    novo: 'border-white/[0.09] bg-white/[0.055] text-zinc-300',
    contatado: 'border-sky-400/15 bg-sky-400/10 text-sky-300',
    proposta: 'border-violet-400/15 bg-violet-400/10 text-violet-300',
    fechado: 'border-emerald-400/15 bg-emerald-400/10 text-emerald-300',
  }
  const labels = { novo: 'Novo', contatado: 'Contatado', proposta: 'Proposta', fechado: 'Fechado' }
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium ${map[stage]}`}>{labels[stage]}</span>
}

export function PriorityBadge({ priority }: { priority: number }) {
  const cls = priority >= 80
    ? 'border-emerald-400/15 bg-emerald-400/10 text-emerald-300'
    : priority >= 60
      ? 'border-amber-400/15 bg-amber-400/10 text-amber-300'
      : 'border-white/[0.08] bg-white/[0.045] text-zinc-400'
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium ${cls}`}>{priority} pts</span>
}

export function WebsiteBadge({ hasWebsite }: { hasWebsite: boolean }) {
  return hasWebsite ? (
    <span className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.045] px-2.5 py-1 text-[10px] font-medium text-zinc-400">Com site</span>
  ) : (
    <span className="inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.08em] text-amber-300">Sem site</span>
  )
}
