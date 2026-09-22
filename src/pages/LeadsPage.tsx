import { Copy, Eye, Pencil, Trash } from 'lucide-react'
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
import { formatCurrency, formatDate } from '../lib/utils'
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
      <PageHeader title="Meus leads" subtitle="CRM para gestão e qualificação" />
      <Card className="mb-4 grid gap-3 md:grid-cols-3">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, nicho ou cidade" />
        <Select value={stage} onChange={(e) => setStage(e.target.value as 'todos' | LeadStage)}>
          <option value="todos">Todos os estágios</option>
          <option value="novo">Novo</option>
          <option value="contatado">Contatado</option>
          <option value="proposta">Proposta</option>
          <option value="fechado">Fechado</option>
        </Select>
      </Card>

      <div className="grid gap-3">
        {filtered.length === 0 ? <Card>Nenhum lead encontrado.</Card> : null}
        {filtered.map((lead) => (
          <LeadRow
            key={lead.id}
            lead={lead}
            editing={editingId === lead.id}
            onEditToggle={() => setEditingId((v) => (v === lead.id ? null : lead.id))}
            onPatch={(patch) => patchLead(lead.id, patch)}
            onDelete={() => {
              if (confirm(`Excluir ${lead.name}?`)) removeLead(lead.id)
            }}
            onDuplicate={() => copyLead(lead.id)}
          />
        ))}
      </div>
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
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-white">{lead.name}</p>
          <p className="text-sm text-zinc-400">{lead.niche} • {lead.city}</p>
          <p className="text-sm text-zinc-500">Último contato: {formatDate(lead.lastContact)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <WebsiteBadge hasWebsite={Boolean(lead.website)} />
          <PriorityBadge priority={lead.priority} />
          <StageBadge stage={lead.stage} />
        </div>
      </div>
      <div className="mt-2 text-sm text-zinc-400">Valor potencial: {formatCurrency(lead.potentialValue)}</div>
      {editing ? (
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <Input type="number" value={draft.potentialValue} onChange={(e) => setDraft((v) => ({ ...v, potentialValue: Number(e.target.value) }))} />
          <Textarea value={draft.notes} onChange={(e) => setDraft((v) => ({ ...v, notes: e.target.value }))} />
          <Button className="md:col-span-2" onClick={() => onPatch(draft)}>Salvar edição</Button>
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Link to={`/lead/${lead.id}`}><Button variant="outline"><Eye className="mr-1 h-4 w-4" />Detalhes</Button></Link>
        <Button variant="secondary" onClick={onEditToggle}><Pencil className="mr-1 h-4 w-4" />Editar</Button>
        <Button variant="ghost" onClick={onDuplicate}><Copy className="mr-1 h-4 w-4" />Duplicar</Button>
        <Button variant="ghost" onClick={onDelete}><Trash className="mr-1 h-4 w-4" />Excluir</Button>
      </div>
    </Card>
  )
}
