import { LayoutDashboard, Radar, Users, KanbanSquare, WandSparkles, Settings, Menu, X, Zap, Circle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Button } from './ui/button'
import { getGooglePlacesStatus } from '../services/leadSearchService'

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/radar', label: 'Radar de leads', icon: Radar },
  { to: '/leads', label: 'Meus leads', icon: Users },
  { to: '/pipeline', label: 'Funil comercial', icon: KanbanSquare },
  { to: '/prompt-generator', label: 'Gerador de prompts', icon: WandSparkles },
  { to: '/settings', label: 'Configurações', icon: Settings },
]

function Brand() {
  return (
    <Link to="/dashboard" className="group flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-2xl border border-[#ff2438]/25 bg-[#ff2438]/10 shadow-[0_10px_30px_rgba(255,36,56,.12)]">
        <Zap className="size-5 text-[#ff2438]" />
      </span>
      <span>
        <span className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-white">
          LeadForge <span className="rounded-md border border-[#ff2438]/25 bg-[#ff2438]/10 px-1.5 py-0.5 text-[9px] font-bold tracking-[.16em] text-[#ff5668]">PRO</span>
        </span>
        <span className="mt-0.5 block text-[11px] text-zinc-500">Prospecção inteligente</span>
      </span>
    </Link>
  )
}

function NavContent({ onClick, googleReady }: { onClick?: () => void; googleReady: boolean | null }) {
  return (
    <>
      <Brand />
      <div className="my-7 h-px bg-white/[0.055]" />
      <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[.18em] text-zinc-600">Workspace</p>
      <nav className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClick}
            className={({ isActive }) =>
              `group flex h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? 'border border-[#ff2438]/15 bg-[#ff2438]/10 text-white shadow-[inset_3px_0_0_#ff2438]'
                  : 'border border-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100'
              }`
            }
          >
            <item.icon className="size-[17px] text-zinc-500 transition group-hover:text-zinc-200" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-zinc-200">Fonte de dados</p>
            <p className="mt-1 text-[11px] text-zinc-500">
              {googleReady === null ? 'Verificando integração...' : googleReady ? 'Google Places conectado' : 'Modo demonstração'}
            </p>
          </div>
          <span className={`grid size-7 place-items-center rounded-full ${googleReady ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
            <Circle className={`size-2.5 fill-current ${googleReady ? 'text-emerald-400' : 'text-amber-400'}`} />
          </span>
        </div>
      </div>
    </>
  )
}

export function AppShell() {
  const [open, setOpen] = useState(false)
  const [googleReady, setGoogleReady] = useState<boolean | null>(null)

  useEffect(() => {
    getGooglePlacesStatus().then(setGoogleReady)
  }, [])

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#090a0d]/95 px-4 backdrop-blur md:hidden">
        <Brand />
        <Button variant="ghost" onClick={() => setOpen((v) => !v)} aria-label="Menu" className="size-10 px-0">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-white/[0.055] bg-[#0a0b0e] px-4 py-5 md:flex">
          <NavContent googleReady={googleReady} />
        </aside>

        {open ? (
          <aside className="fixed inset-0 z-30 flex md:hidden">
            <button className="flex-1 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} aria-label="Fechar menu" />
            <div className="flex h-full w-[285px] flex-col border-l border-white/[0.07] bg-[#0a0b0e] px-4 py-5">
              <NavContent googleReady={googleReady} onClick={() => setOpen(false)} />
            </div>
          </aside>
        ) : null}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 xl:px-10 xl:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
