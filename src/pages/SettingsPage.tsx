import { useEffect, useState } from 'react'
import { CheckCircle2, Database, RotateCcw, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Checkbox } from '../components/ui/checkbox'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { useAppData } from '../hooks/useAppData'
import { getScraperStatus } from '../services/leadSearchService'

function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[.14em] text-zinc-600">{children}</span>
}

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
        eyebrow="Sistema"
        title="Configurações"
        subtitle="Padrões de operação, preferências do workspace e status das integrações."
      />

      <div className="grid gap-4 xl:grid-cols-[1.05fr_.72fr]">
        <Card>
          <div className="mb-6 flex items-start gap-3">
            <span className="grid size-9 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-zinc-500">
              <SlidersHorizontal className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Preferências da operação</p>
              <p className="mt-1 text-[11px] text-zinc-600">Defina os valores usados por padrão em novas oportunidades.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <Label>Workspace</Label>
              <Input value={draft.workspaceName} onChange={(event) => setDraft((value) => ({ ...value, workspaceName: event.target.value }))} />
            </label>
            <label>
              <Label>Moeda</Label>
              <Select value={draft.currency} onChange={(event) => setDraft((value) => ({ ...value, currency: event.target.value as 'BRL' }))}>
                <option value="BRL">BRL · Real brasileiro</option>
              </Select>
            </label>
            <label>
              <Label>Valor potencial padrão</Label>
              <Input type="number" min={0} value={draft.defaultPotentialValue} onChange={(event) => setDraft((value) => ({ ...value, defaultPotentialValue: Number(event.target.value) }))} />
            </label>
            <label>
              <Label>Resultados por busca</Label>
              <Input type="number" min={1} max={20} value={Math.min(draft.defaultResultLimit, 20)} onChange={(event) => setDraft((value) => ({ ...value, defaultResultLimit: Math.min(20, Math.max(1, Number(event.target.value) || 1)) }))} />
            </label>
          </div>

          <label className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div>
              <p className="text-[12px] font-semibold text-zinc-300">Modo compacto</p>
              <p className="mt-1 text-[10px] leading-5 text-zinc-600">Reduz espaçamentos para mostrar mais informação em telas menores.</p>
            </div>
            <Checkbox checked={draft.compactMode} onChange={(event) => setDraft((value) => ({ ...value, compactMode: event.target.checked }))} />
          </label>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-white/[0.05] pt-5">
            <Button onClick={() => setSettings(draft)}>
              <CheckCircle2 className="size-4" />
              Salvar configurações
            </Button>
            <Button variant="outline" onClick={() => { if (confirm('Limpar todos os leads salvos?')) resetLeads() }}>
              <RotateCcw className="size-4" />
              Limpar base de leads
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex items-start gap-3">
              <span className="grid size-9 place-items-center rounded-xl border border-[#ff304d]/20 bg-[#ff304d]/[0.08] text-[#ff6378]">
                <Database className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Fonte de dados</p>
                <p className="mt-1 text-[11px] leading-5 text-zinc-600">O Radar usa dados extraídos do Google Maps pelo serviço de scraper.</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#090c11] p-3.5">
              <div>
                <p className="text-[11px] font-semibold text-zinc-300">Google Maps Scraper</p>
                <p className="mt-1 text-[9px] text-zinc-600">
                  {googleReady === null ? 'Verificando integração...' : googleReady ? 'Conectado e operacional' : 'Não configurado'}
                </p>
              </div>
              <span className={`size-2.5 rounded-full ${googleReady ? 'bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,.35)]' : 'bg-red-400'}`} />
            </div>
          </Card>

          <Card>
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-400" />
              <div>
                <p className="text-[11px] font-semibold text-zinc-300">Credenciais protegidas</p>
                <p className="mt-1 text-[10px] leading-5 text-zinc-600">
                  As credenciais ficam no ambiente server-side da Vercel e não são expostas no navegador.
                </p>
                <div className="mt-3 space-y-1.5 font-mono text-[9px] text-zinc-600">
                  <p>GMAPS_SCRAPER_URL</p>
                  <p>GMAPS_SCRAPER_API_KEY</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
