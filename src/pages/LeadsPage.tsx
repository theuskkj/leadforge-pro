import { Copy, Eye, Pencil, Search, Trash, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { PriorityBadge, StageBadge, WebsiteBadge } from '../components/Badges'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import { useAppData } from '../hooks/useAppData'
import { formatCurrency, formatDate, initials } from '../lib/utils'
import type { Lead, LeadStage } from '../types'

export function LeadsPage() {
  const { leads, patchLead, removeLead, copyLead } = useAppData()
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState<'todos' | LeadStage>('todos')
  const [editingId, setEditingId] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      leads.filter((lead) => {
        const passStage = stage === 'todos' || lead.stage === stage
        const query = search.toLowerCase().trim()
        const passSearch =
          lead.name.toLowerCase().includes(query) ||
          lead.niche.toLowerCase().includes(query) ||
          lead.city.toLowerCase().includes(query)
        return passStage && passSearch
      }),
    [leads, search, stage],
  )

  const totalValue = filtered.reduce((sum, lead) => sum + lead.potentialValue, 0)

  return (
    <>
      <PageHeader
        eyebrow="CRM / Base"
        title="Base de leads"
        subtitle="Consulte, filtre e mantenha os próximos passos de cada oportunidade em um só lugar."
        actions={
          <div className="flex gap-2">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-2">
              <p className="text-[9px] uppercase tracking-[.14em] text-zinc-600">Leads visíveis</p>
              <p className="tabular mt-1 text-sm font-semibold text-zinc-200">{filtered.length}</p>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-2">
              <p className="text-[9px] uppercase tracking-[.14em] text-zinc-600">Valor potencial</p>
              <p className="tabular mt-1 text-sm font-semibold text-zinc-200">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        }
      />

      <Card className="mb-3 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-600" />
            <Input className="pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar empresa, nicho ou cidade..." />
          </div>
          <Select className="lg:w-[220px]" value={stage} onChange={(event) => setStage(event.target.value as 'todos' | LeadStage)}>
            <option value="todos">Todos os estágios</option>
            <option value="novo">Novo</option>
            <option value="contatado">Contatado</option>
            <option value="proposta">Proposta</option>
            <option value="fechado">Fechado</option>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="hidden grid-cols-[1.6fr_.9fr_.6fr_.7fr_.75fr_auto] gap-3 border-b border-white/[0.055] bg-white/[0.012] px-5 py-3 text-[8px] font-semibold uppercase tracking-[.15em] text-zinc-700 lg:grid">
          <span>Empresa</span>
          <span>Segmento</span>
          <span>Prioridade</span>
          <span>Estágio</span>
          <span>Valor</span>
          <span>Ações</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <span className="mx-auto grid size-11 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.025]">
              <Users className="size-5 text-zinc-700" />
            </span>
            <p className="mt-4 text-sm font-medium text-zinc-300">Nenhum lead encontrado</p>
            <p className="mt-1.5 text-[11px] text-zinc-600">Ajuste os filtros ou adicione novos leads pelo Radar.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {filtered.map((lead) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                editing={editingId === lead.id}
                onEditToggle={() => setEditingId((value) => (value === lead.id ? null : lead.id))}
                onPatch={(patch) => patchLead(lead.id, patch)}
                onDelete={() => {
                  if (confirm(`Excluir ${lead.name}?`)) removeLead(lead.id)
                }}
                onDuplicate={() => copyLead(lead.id)}
              />
            ))}
          </div>
        )}
      </Card>
    </>
  )
}

function LeadRow({
  lead,
  editing,
  onEditToggle,
  onPatch,
  onDelete,
  onDuplicate,
}: {
  lead: Lead
  editing: boolean
  onEditToggle: () => void
  onPatch: (patch: Partial<Lead>) => void
  onDelete: () => void
  onDuplicate: () => void
}) {
  const [draft, setDraft] = useState({ notes: lead.notes, potentialValue: lead.potentialValue })

  return (
    <div className="px-4 py-4 transition hover:bg-white/[0.014] sm:px-5">
      <div className="grid items-center gap-3 lg:grid-cols-[1.6fr_.9fr_.6fr_.7fr_.75fr_auto]">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.035] text-[10px] font-semibold text-zinc-300">
            {initials(lead.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-zinc-100">{lead.name}</p>
            <p className="mt-1 truncate text-[9px] text-zinc-600">
              {lead.city} · último contato {formatDate(lead.lastContact)}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <WebsiteBadge hasWebsite={Boolean(lead.website)} />
          <span className="truncate text-[10px] text-zinc-600">{lead.niche}</span>
        </div>
        <div><PriorityBadge priority={lead.priority} /></div>
        <div><StageBadge stage={lead.stage} /></div>
        <div className="tabular text-xs font-semibold text-zinc-300">{formatCurrency(lead.potentialValue)}</div>

        <div className="flex flex-wrap justify-start gap-1 lg:justify-end">
          <Link to={`/lead/${lead.id}`}>
            <Button variant="ghost" className="size-9 px-0" title="Detalhes"><Eye className="size-4" /></Button>
          </Link>
          <Button variant="ghost" className="size-9 px-0" onClick={onEditToggle} title="Editar"><Pencil className="size-4" /></Button>
          <Button variant="ghost" className="size-9 px-0" onClick={onDuplicate} title="Duplicar"><Copy className="size-4" /></Button>
          <Button variant="ghost" className="size-9 px-0 text-zinc-600 hover:text-red-300" onClick={onDelete} title="Excluir"><Trash className="size-4" /></Button>
        </div>
      </div>

      {editing ? (
        <div className="mt-4 grid gap-3 rounded-xl border border-white/[0.06] bg-black/10 p-3 md:grid-cols-[220px_1fr_auto] md:items-start">
          <Input type="number" value={draft.potentialValue} onChange={(event) => setDraft((value) => ({ ...value, potentialValue: Number(event.target.value) }))} />
          <Textarea className="min-h-20" value={draft.notes} onChange={(event) => setDraft((value) => ({ ...value, notes: event.target.value }))} />
          <Button onClick={() => onPatch(draft)}>Salvar edição</Button>
        </div>
      ) : null}
    </div>
  )
}
