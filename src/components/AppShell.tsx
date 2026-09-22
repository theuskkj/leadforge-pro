import { LayoutDashboard, Radar, Users, KanbanSquare, WandSparkles, Settings, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Button } from './ui/button'

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/radar', label: 'Radar de leads', icon: Radar },
  { to: '/leads', label: 'Meus leads', icon: Users },
  { to: '/pipeline', label: 'Funil comercial', icon: KanbanSquare },
  { to: '/prompt-generator', label: 'Gerador de prompts', icon: WandSparkles },
  { to: '/settings', label: 'Configurações', icon: Settings },
]

function NavContent({ onClick }: { onClick?: () => void }) {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white">LeadForge Pro</h2>
        <p className="text-xs text-zinc-400">Prospecção inteligente para vender websites</p>
      </div>
      <nav className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClick}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition ${isActive ? 'bg-[#ff2438] text-white' : 'text-zinc-300 hover:bg-zinc-800'}`
            }
          >
            <item.icon className="h-4 w-4" /> {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto rounded-3xl border border-zinc-800 bg-[#141416] p-4 text-sm text-zinc-300">
        <p className="font-medium text-white">LeadForge Pro</p>
        <p className="text-xs text-zinc-400">Automatize sua prospecção e venda mais sites.</p>
      </div>
    </>
  )
}

export function AppShell() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-800 bg-[#0c0c0f] p-4 md:hidden">
        <Link to="/dashboard" className="font-semibold text-white">LeadForge Pro</Link>
        <Button variant="ghost" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-zinc-800 bg-[#0c0c0f] p-6 md:flex">
          <NavContent />
        </aside>
        {open ? (
          <aside className="fixed inset-0 z-30 flex md:hidden">
            <button className="flex-1 bg-black/60" onClick={() => setOpen(false)} aria-label="Fechar menu" />
            <div className="flex h-full w-72 flex-col bg-[#0c0c0f] p-6">
              <NavContent onClick={() => setOpen(false)} />
            </div>
          </aside>
        ) : null}
        <main className="w-full p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
