import { Copy, Eye, Pencil, Search, Trash } from 'lucide-react'
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
        const query = search.toLowerCase()
        const passSearch =
          lead.name.toLowerCase().includes(query) ||
          lead.niche.toLowerCase().includes(query) ||
          lead.city.toLowerCase().includes(query)
        return passStage && passSearch
      }),
    [leads, search, stage],
  )

  return (
    <>
      <PageHeader eyebrow="CRM" title="Meus leads" subtitle="Organize oportunidades, valores e próximos passos em uma visão comercial limpa." />

      <Card className="mb-3 p-4">
        <div className="grid gap-3 md:grid-cols-[1.5fr_.7fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-600" />
            <Input className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar empresa, nicho ou cidade..." />
          </div>
          <Select value={stage} onChange={(e) => setStage(e.target.value as 'todos' | LeadStage)}>
            <option value="todos">Todos os estágios</option>
            <option value="novo">Novo</option>
            <option value="contatado">Contatado</option>
            <option value="proposta">Proposta</option>
            <option value="fechado">Fechado</option>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="hidden grid-cols-[1.6fr_.8fr_.55fr_.65fr_.75fr_auto] gap-3 border-b border-white/[0.06] px-5 py-3 text-[9px] font-semibold uppercase tracking-[.13em] text-zinc-600 lg:grid">
          <span>Empresa</span><span>Nicho</span><span>Prioridade</span><span>Estágio</span><span>Valor</span><span>Ações</span>
        </div>
        {filtered.length === 0 ? (
          <div className="py-14 text-center text-sm text-zinc-600">Nenhum lead encontrado.</div>
        ) : (
          <div className="divide-y divide-white/[0.055]">
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
    <div className="px-4 py-4 transition hover:bg-white/[0.018] sm:px-5">
      <div className="grid items-center gap-3 lg:grid-cols-[1.6fr_.8fr_.55fr_.65fr_.75fr_auto]">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-[10px] font-semibold text-zinc-300">{initials(lead.name)}</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-100">{lead.name}</p>
            <p className="mt-0.5 truncate text-[10px] text-zinc-600">{lead.city} · {formatDate(lead.lastContact)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500"><WebsiteBadge hasWebsite={Boolean(lead.website)} /><span className="hidden 2xl:inline">{lead.niche}</span></div>
        <div><PriorityBadge priority={lead.priority} /></div>
        <div><StageBadge stage={lead.stage} /></div>
        <div className="tabular text-xs font-medium text-zinc-300">{formatCurrency(lead.potentialValue)}</div>
        <div className="flex flex-wrap justify-start gap-1 lg:justify-end">
          <Link to={`/lead/${lead.id}`}><Button variant="ghost" className="size-9 px-0" title="Detalhes"><Eye className="size-4" /></Button></Link>
          <Button variant="ghost" className="size-9 px-0" onClick={onEditToggle} title="Editar"><Pencil className="size-4" /></Button>
          <Button variant="ghost" className="size-9 px-0" onClick={onDuplicate} title="Duplicar"><Copy className="size-4" /></Button>
          <Button variant="ghost" className="size-9 px-0 text-zinc-600 hover:text-red-300" onClick={onDelete} title="Excluir"><Trash className="size-4" /></Button>
        </div>
      </div>

      {editing ? (
        <div className="mt-4 grid gap-2 rounded-2xl border border-white/[0.06] bg-black/10 p-3 md:grid-cols-2">
          <Input type="number" value={draft.potentialValue} onChange={(e) => setDraft((value) => ({ ...value, potentialValue: Number(e.target.value) }))} />
          <Textarea value={draft.notes} onChange={(e) => setDraft((value) => ({ ...value, notes: e.target.value }))} />
          <Button className="md:col-span-2" onClick={() => onPatch(draft)}>Salvar edição</Button>
        </div>
      ) : null}
    </div>
  )
}
