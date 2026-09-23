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
    <div className="mb-7 flex flex-col gap-5 border-b border-white/[0.05] pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <div className="mb-3 flex items-center gap-2">
            <span className="h-px w-5 bg-[#ff304d]" />
            <p className="text-[9px] font-semibold uppercase tracking-[.2em] text-[#ff6378]">{eyebrow}</p>
          </div>
        ) : null}
        <h1 className="text-[30px] font-semibold tracking-[-0.045em] text-[#f7f8fb] sm:text-[34px]">{title}</h1>
        {subtitle ? <p className="mt-2.5 max-w-2xl text-[13px] leading-6 text-zinc-500">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
