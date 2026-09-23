import type { ReactNode } from 'react'

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
}: {
  title: string
  subtitle?: string
  eyebrow?: string
  actions?: ReactNode
}) {
  return (
    <header className="mb-6 flex flex-col gap-5 border-b border-white/[0.055] pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 max-w-3xl">
        {eyebrow ? (
          <p className="operational-kicker mb-2.5 text-[8px] font-semibold text-[#ef5269]">{eyebrow}</p>
        ) : null}
        <h1 className="text-[29px] font-semibold tracking-[-0.04em] text-[#f7f8fb] sm:text-[33px]">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-[12px] leading-5 text-[#7f8896]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}
