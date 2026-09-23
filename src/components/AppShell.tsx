import {
  Circle,
  KanbanSquare,
  LayoutDashboard,
  Menu,
  Radar,
  Settings,
  Sparkles,
  Users,
  WandSparkles,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Button } from './ui/button'
import { getScraperStatus } from '../services/leadSearchService'
import { useAppData } from '../hooks/useAppData'

const groups = [
  {
    label: 'Operação',
    items: [
      { to: '/dashboard', label: 'Visão geral', icon: LayoutDashboard },
      { to: '/radar', label: 'Radar de leads', icon: Radar },
    ],
  },
  {
    label: 'CRM',
    items: [
      { to: '/leads', label: 'Base de leads', icon: Users },
      { to: '/pipeline', label: 'Pipeline', icon: KanbanSquare },
    ],
  },
  {
    label: 'Criação',
    items: [
      { to: '/prompt-generator', label: 'Prompt Studio', icon: WandSparkles },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/settings', label: 'Configurações', icon: Settings },
    ],
  },
]

function Brand() {
  return (
    <Link to="/dashboard" className="group flex items-center gap-3">
      <span className="relative grid size-10 place-items-center rounded-xl border border-[#ff304d]/25 bg-[#ff304d]/10 shadow-[0_10px_30px_rgba(255,48,77,.10)]">
        <Zap className="size-[18px] fill-[#ff304d]/15 text-[#ff526b]" />
        <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[#0a0d12] bg-emerald-400" />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2 text-[14px] font-semibold tracking-[-0.02em] text-white">
          LeadForge
          <span className="rounded-md border border-white/[0.08] bg-white/[0.045] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[.16em] text-zinc-400">Pro</span>
        </span>
        <span className="mt-0.5 block text-[10px] text-zinc-600">Sales intelligence workspace</span>
      </span>
    </Link>
  )
}

function NavContent({
  onClick,
  googleReady,
  workspaceName,
}: {
  onClick?: () => void
  googleReady: boolean | null
  workspaceName: string
}) {
  return (
    <>
      <Brand />

      <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5">
        <p className="text-[9px] font-semibold uppercase tracking-[.15em] text-zinc-600">Workspace</p>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <p className="truncate text-xs font-medium text-zinc-300">{workspaceName}</p>
          <Sparkles className="size-3.5 shrink-0 text-zinc-600" />
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[.18em] text-zinc-700">{group.label}</p>
            <nav className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClick}
                  className={({ isActive }) =>
                    `group flex h-10 items-center gap-3 rounded-xl border px-3 text-[12px] font-medium transition-all duration-200 ${
                      isActive
                        ? 'border-white/[0.08] bg-white/[0.06] text-white shadow-[inset_2px_0_0_#ff304d]'
                        : 'border-transparent text-zinc-500 hover:border-white/[0.05] hover:bg-white/[0.025] hover:text-zinc-200'
                    }`
                  }
                >
                  <item.icon className="size-4 text-zinc-600 transition-colors group-hover:text-zinc-300" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className="mt-auto space-y-2.5">
        <div className="rounded-xl border border-white/[0.06] bg-[#0c0f14] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-medium text-zinc-300">Google Maps Scraper</p>
              <p className="mt-1 text-[9px] text-zinc-600">
                {googleReady === null ? 'Verificando conexão' : googleReady ? 'Online e pronto' : 'Requer configuração'}
              </p>
            </div>
            <span className={`grid size-7 place-items-center rounded-lg border ${
              googleReady
                ? 'border-emerald-400/15 bg-emerald-400/[0.07]'
                : 'border-red-400/15 bg-red-400/[0.07]'
            }`}>
              <Circle className={`size-2 fill-current ${googleReady ? 'text-emerald-400' : 'text-red-400'}`} />
            </span>
          </div>
        </div>
        <p className="px-1 text-[9px] text-zinc-700">LeadForge Pro · dados persistidos localmente</p>
      </div>
    </>
  )
}

export function AppShell() {
  const [open, setOpen] = useState(false)
  const [googleReady, setGoogleReady] = useState<boolean | null>(null)
  const { settings } = useAppData()

  useEffect(() => {
    getScraperStatus().then(setGoogleReady)
  }, [])

  return (
    <div className="min-h-screen bg-transparent text-zinc-100">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#080a0f]/92 px-4 backdrop-blur-xl md:hidden">
        <Brand />
        <Button variant="ghost" onClick={() => setOpen((value) => !value)} aria-label="Abrir menu" className="size-10 px-0">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </header>

      <div className="mx-auto flex max-w-[1720px]">
        <aside className="sticky top-0 hidden h-screen w-[246px] shrink-0 flex-col border-r border-white/[0.055] bg-[#090c11]/94 px-4 py-5 backdrop-blur-xl md:flex">
          <NavContent googleReady={googleReady} workspaceName={settings.workspaceName} />
        </aside>

        {open ? (
          <aside className="fixed inset-0 z-40 flex md:hidden">
            <button className="flex-1 bg-black/72 backdrop-blur-sm" onClick={() => setOpen(false)} aria-label="Fechar menu" />
            <div className="flex h-full w-[290px] flex-col border-l border-white/[0.07] bg-[#090c11] px-4 py-5 shadow-2xl">
              <NavContent googleReady={googleReady} workspaceName={settings.workspaceName} onClick={() => setOpen(false)} />
            </div>
          </aside>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="sticky top-0 z-10 hidden h-14 items-center justify-between border-b border-white/[0.05] bg-[#07090d]/82 px-6 backdrop-blur-xl md:flex lg:px-8 xl:px-10">
            <div className="flex items-center gap-2 text-[10px] text-zinc-600">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Operação ativa
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.055] bg-white/[0.02] px-2.5 py-1.5 text-[9px] font-medium uppercase tracking-[.12em] text-zinc-600">
              <Zap className="size-3 text-[#ff526b]" />
              Lead intelligence
            </div>
          </div>

          <main className="relative min-w-0 px-4 py-6 sm:px-6 lg:px-8 xl:px-10 xl:py-9">
            <div className="mx-auto w-full max-w-[1480px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
