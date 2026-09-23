import {
  Circle,
  KanbanSquare,
  LayoutDashboard,
  Menu,
  Radar,
  Settings,
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
    <Link to="/dashboard" className="group flex min-w-0 items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-[#d92d46]/30 bg-[#d92d46]/10">
        <Zap className="size-[17px] fill-[#d92d46]/14 text-[#ef5269]" />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2 text-[14px] font-semibold tracking-[-0.025em] text-white">
          LeadForge
          <span className="rounded-[5px] border border-white/[0.08] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[.14em] text-zinc-500">
            Pro
          </span>
        </span>
        <span className="mt-0.5 block truncate text-[9px] text-zinc-600">Prospecção e operação comercial</span>
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

      <div className="mt-6 border-y border-white/[0.055] py-3">
        <p className="text-[8px] font-semibold uppercase tracking-[.16em] text-zinc-700">Workspace ativo</p>
        <p className="mt-1.5 truncate text-[11px] font-medium text-zinc-300">{workspaceName}</p>
      </div>

      <div className="mt-5 space-y-5">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-2 text-[8px] font-semibold uppercase tracking-[.16em] text-zinc-700">{group.label}</p>
            <nav aria-label={group.label} className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClick}
                  className={({ isActive }) =>
                    `group relative flex h-10 items-center gap-3 rounded-[9px] px-3 text-[12px] font-medium transition-colors ${
                      isActive
                        ? 'bg-white/[0.055] text-white'
                        : 'text-zinc-500 hover:bg-white/[0.025] hover:text-zinc-200'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[#d92d46]" /> : null}
                      <item.icon className="size-4 text-zinc-600 transition-colors group-hover:text-zinc-300" />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className="mt-auto border-t border-white/[0.055] pt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-medium text-zinc-400">Google Maps Scraper</p>
            <p className="mt-1 text-[8px] text-zinc-700">
              {googleReady === null ? 'Verificando serviço' : googleReady ? 'Conectado' : 'Requer configuração'}
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[.12em] text-zinc-600">
            <Circle className={`size-2 fill-current ${googleReady ? 'text-emerald-400' : 'text-red-400'}`} />
            {googleReady ? 'Online' : 'Offline'}
          </span>
        </div>
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
    <div className="min-h-screen bg-[#08090c] text-zinc-100">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.055] bg-[#08090c]/96 px-4 backdrop-blur md:hidden">
        <Brand />
        <Button variant="ghost" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Fechar menu' : 'Abrir menu'} className="size-10 px-0">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </header>

      <div className="mx-auto flex max-w-[1760px]">
        <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col border-r border-white/[0.055] bg-[#0a0c10] px-4 py-5 md:flex">
          <NavContent googleReady={googleReady} workspaceName={settings.workspaceName} />
        </aside>

        {open ? (
          <aside className="fixed inset-0 z-40 flex md:hidden">
            <button className="flex-1 bg-black/72" onClick={() => setOpen(false)} aria-label="Fechar menu" />
            <div className="flex h-full w-[292px] flex-col border-l border-white/[0.07] bg-[#0a0c10] px-4 py-5 shadow-2xl">
              <NavContent googleReady={googleReady} workspaceName={settings.workspaceName} onClick={() => setOpen(false)} />
            </div>
          </aside>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="sticky top-0 z-20 hidden h-12 items-center justify-between border-b border-white/[0.05] bg-[#08090c]/94 px-6 backdrop-blur md:flex lg:px-8 xl:px-10">
            <div className="flex items-center gap-2 text-[9px] font-medium text-zinc-600">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Operação ativa
            </div>
            <div className="flex items-center gap-4 text-[9px] text-zinc-700">
              <span>Dados persistidos localmente</span>
              <span className="h-3 w-px bg-white/[0.06]" />
              <span className="uppercase tracking-[.13em]">Lead intelligence</span>
            </div>
          </div>

          <main className="relative min-w-0 px-4 py-6 sm:px-6 lg:px-8 xl:px-10 xl:py-8">
            <div className="mx-auto w-full max-w-[1480px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
