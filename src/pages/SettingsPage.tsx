import { useEffect, useState } from 'react'
import { CheckCircle2, Database, RotateCcw, ShieldCheck } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Checkbox } from '../components/ui/checkbox'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { useAppData } from '../hooks/useAppData'
import { getScraperStatus } from '../services/leadSearchService'

export function SettingsPage() {
  const { settings, setSettings, resetLeads } = useAppData()
  const [draft, setDraft] = useState(settings)
  const [googleReady, setGoogleReady] = useState<boolean | null>(null)

  useEffect(() => {
    getScraperStatus().then(setGoogleReady)
  }, [])

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Configurações"
        subtitle="Defina os padrões da sua operação e escolha a fonte usada no Radar de leads."
      />

      <div className="grid gap-3 xl:grid-cols-[1fr_.72fr]">
        <Card>
          <div className="mb-5">
            <p className="text-[15px] font-semibold text-white">Preferências gerais</p>
            <p className="mt-1 text-xs text-zinc-500">Esses valores são usados como padrão em novas oportunidades.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[.14em] text-zinc-600">Workspace</span>
              <Input value={draft.workspaceName} onChange={(e) => setDraft((value) => ({ ...value, workspaceName: e.target.value }))} />
            </label>
            <label>
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[.14em] text-zinc-600">Moeda</span>
              <Select value={draft.currency} onChange={(e) => setDraft((value) => ({ ...value, currency: e.target.value as 'BRL' }))}>
                <option value="BRL">BRL · Real brasileiro</option>
              </Select>
            </label>
            <label>
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[.14em] text-zinc-600">Valor potencial padrão</span>
              <Input type="number" min={0} value={draft.defaultPotentialValue} onChange={(e) => setDraft((value) => ({ ...value, defaultPotentialValue: Number(e.target.value) }))} />
            </label>
            <label>
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[.14em] text-zinc-600">Resultados por busca</span>
              <Input type="number" min={1} max={20} value={Math.min(draft.defaultResultLimit, 20)} onChange={(e) => setDraft((value) => ({ ...value, defaultResultLimit: Math.min(20, Math.max(1, Number(e.target.value) || 1)) }))} />
            </label>
          </div>

          <label className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
            <div>
              <p className="text-xs font-medium text-zinc-300">Modo compacto</p>
              <p className="mt-1 text-[11px] text-zinc-600">Reduz espaçamentos para exibir mais dados na tela.</p>
            </div>
            <Checkbox checked={draft.compactMode} onChange={(e) => setDraft((value) => ({ ...value, compactMode: e.target.checked }))} />
          </label>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={() => setSettings(draft)}><CheckCircle2 className="size-4" />Salvar configurações</Button>
            <Button variant="outline" onClick={() => { if (confirm('Limpar todos os leads salvos?')) resetLeads() }}><RotateCcw className="size-4" />Limpar base de leads</Button>
          </div>
        </Card>

        <div className="space-y-3">
          <Card>
            <div className="flex items-start gap-3">
              <div className="grid size-10 place-items-center rounded-2xl border border-[#ff2438]/20 bg-[#ff2438]/10">
                <Database className="size-4.5 text-[#ff5668]" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-white">Fonte de dados</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">O Radar consulta exclusivamente dados reais extraídos do Google Maps pelo scraper.</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#0d0e11] p-3.5">
              <div>
                <p className="text-xs font-medium text-zinc-300">Google Maps Scraper</p>
                <p className="mt-1 text-[11px] text-zinc-600">
                  {googleReady === null ? 'Verificando...' : googleReady ? 'Configurada no servidor' : 'Não configurada — pesquisas bloqueadas'}
                </p>
              </div>
              <span className={`size-2.5 rounded-full ${googleReady ? 'bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,.45)]' : 'bg-red-400'}`} />
            </div>
          </Card>

          <Card className="border-emerald-400/10">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-400" />
              <div>
                <p className="text-xs font-medium text-zinc-300">Chave protegida</p>
                <p className="mt-1 text-[11px] leading-5 text-zinc-600">As credenciais do scraper nunca ficam no navegador. A Vercel usa apenas <code className="text-zinc-400">GMAPS_SCRAPER_URL</code> e <code className="text-zinc-400">GMAPS_SCRAPER_API_KEY</code> no servidor.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
