import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Checkbox } from '../components/ui/checkbox'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { useAppData } from '../hooks/useAppData'

export function SettingsPage() {
  const { settings, setSettings, resetLeads } = useAppData()
  const [draft, setDraft] = useState(settings)

  return (
    <>
      <PageHeader title="Configurações" subtitle="Preferências do workspace" />
      <Card className="grid gap-3 md:grid-cols-2">
        <Input value={draft.workspaceName} onChange={(e) => setDraft((v) => ({ ...v, workspaceName: e.target.value }))} placeholder="Nome do workspace" />
        <Select value={draft.currency} onChange={(e) => setDraft((v) => ({ ...v, currency: e.target.value as 'BRL' }))}>
          <option value="BRL">BRL</option>
        </Select>
        <Input type="number" value={draft.defaultPotentialValue} onChange={(e) => setDraft((v) => ({ ...v, defaultPotentialValue: Number(e.target.value) }))} placeholder="Valor potencial padrão" />
        <Input type="number" value={draft.defaultResultLimit} onChange={(e) => setDraft((v) => ({ ...v, defaultResultLimit: Number(e.target.value) }))} placeholder="Limite padrão de resultados" />
        <Select value={draft.searchProvider} onChange={(e) => setDraft((v) => ({ ...v, searchProvider: e.target.value as 'mock' | 'endpoint' }))}>
          <option value="mock">Mock</option>
          <option value="endpoint">Endpoint externo</option>
        </Select>
        <Input value={draft.endpointUrl} onChange={(e) => setDraft((v) => ({ ...v, endpointUrl: e.target.value }))} placeholder="URL do endpoint" />
        <div className="md:col-span-2 flex items-center gap-2 rounded-2xl border border-zinc-700 bg-[#1a1a1d] p-3 text-zinc-300">
          <Checkbox checked={draft.compactMode} onChange={(e) => setDraft((v) => ({ ...v, compactMode: e.target.checked }))} />
          Modo compacto
        </div>
        <div className="md:col-span-2 flex flex-wrap gap-2">
          <Button onClick={() => setSettings(draft)}>Salvar configurações</Button>
          <Button variant="outline" onClick={resetLeads}>Resetar dados demo</Button>
        </div>
        <p className="md:col-span-2 text-xs text-zinc-500">Não insira chaves secretas diretamente no frontend. Use apenas URL pública de endpoint.</p>
      </Card>
    </>
  )
}
