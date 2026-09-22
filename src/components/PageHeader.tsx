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
    <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.2em] text-[#ff5668]">{eyebrow}</p> : null}
        <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-white sm:text-[32px]">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
