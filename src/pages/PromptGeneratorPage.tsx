import { Clipboard, Eraser, Save } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import { useAppData } from '../hooks/useAppData'
import { buildWebsitePrompt, type PromptInput } from '../lib/promptBuilder'

const emptyInput: PromptInput = {
  companyName: '',
  niche: '',
  city: '',
  description: '',
  targetAudience: '',
  services: '',
  siteGoal: '',
  visualStyle: 'Premium dark',
  colors: '#070708, #ff2438',
  cta: 'Solicitar orçamento',
}

export function PromptGeneratorPage() {
  const { leads, storePrompt } = useAppData()
  const location = useLocation()
  const prefill = location.state && typeof location.state === 'object' && 'prefill' in location.state ? (location.state.prefill as Partial<PromptInput>) : undefined
  const [selectedLead, setSelectedLead] = useState('')
  const [form, setForm] = useState<PromptInput>({ ...emptyInput, ...prefill })
  const [output, setOutput] = useState('')

  const leadOptions = useMemo(() => leads.map((lead) => ({ id: lead.id, name: lead.name })), [leads])

  function applyLead(leadId: string) {
    setSelectedLead(leadId)
    const lead = leads.find((item) => item.id === leadId)
    if (!lead) return
    setForm((v) => ({
      ...v,
      companyName: lead.name,
      niche: lead.niche,
      city: lead.city,
      description: lead.notes || `Empresa local de ${lead.niche}.`,
      targetAudience: 'Pessoas da região procurando o serviço no Google',
      services: lead.niche,
      siteGoal: 'Gerar novos contatos e pedidos de orçamento',
      cta: 'Falar no WhatsApp',
    }))
  }

  return (
    <>
      <PageHeader title="Gerador de prompts" subtitle="Crie prompts detalhados para geração de websites" />
      <Card className="grid gap-3 md:grid-cols-2">
        <Select value={selectedLead} onChange={(e) => applyLead(e.target.value)}>
          <option value="">Selecionar lead salvo</option>
          {leadOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
        <Input value={form.companyName} onChange={(e) => setForm((v) => ({ ...v, companyName: e.target.value }))} placeholder="Nome da empresa" />
        <Input value={form.niche} onChange={(e) => setForm((v) => ({ ...v, niche: e.target.value }))} placeholder="Nicho" />
        <Input value={form.city} onChange={(e) => setForm((v) => ({ ...v, city: e.target.value }))} placeholder="Cidade" />
        <Textarea value={form.description} onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))} placeholder="Descrição do negócio" />
        <Textarea value={form.targetAudience} onChange={(e) => setForm((v) => ({ ...v, targetAudience: e.target.value }))} placeholder="Público-alvo" />
        <Textarea value={form.services} onChange={(e) => setForm((v) => ({ ...v, services: e.target.value }))} placeholder="Serviços principais" />
        <Textarea value={form.siteGoal} onChange={(e) => setForm((v) => ({ ...v, siteGoal: e.target.value }))} placeholder="Objetivo do site" />
        <Input value={form.visualStyle} onChange={(e) => setForm((v) => ({ ...v, visualStyle: e.target.value }))} placeholder="Estilo visual" />
        <Input value={form.colors} onChange={(e) => setForm((v) => ({ ...v, colors: e.target.value }))} placeholder="Cores desejadas" />
        <Input value={form.cta} onChange={(e) => setForm((v) => ({ ...v, cta: e.target.value }))} placeholder="CTA principal" />
        <div className="md:col-span-2 flex flex-wrap gap-2">
          <Button onClick={() => setOutput(buildWebsitePrompt(form))}>Gerar prompt</Button>
          <Button variant="secondary" onClick={async () => {
            await navigator.clipboard.writeText(output)
            toast.success('Prompt copiado')
          }}><Clipboard className="mr-1 h-4 w-4" />Copiar</Button>
          <Button variant="outline" onClick={() => {
            if (!selectedLead || !output) return
            storePrompt(selectedLead, output)
          }}><Save className="mr-1 h-4 w-4" />Salvar no lead</Button>
          <Button variant="ghost" onClick={() => { setForm(emptyInput); setOutput('') }}><Eraser className="mr-1 h-4 w-4" />Limpar</Button>
        </div>
      </Card>
      <Card className="mt-4">
        <h3 className="mb-2 text-lg text-white">Prompt gerado</h3>
        <pre className="whitespace-pre-wrap text-sm text-zinc-300">{output || 'Preencha os campos e clique em "Gerar prompt".'}</pre>
      </Card>
    </>
  )
}
