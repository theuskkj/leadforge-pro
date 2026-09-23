import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-11 w-full rounded-xl border border-white/[0.085] bg-[#090c11] px-3.5 text-[13px] text-zinc-100 outline-none transition hover:border-white/[0.14] focus:border-[#ff304d]/45 focus:bg-[#0b0e14] focus:ring-4 focus:ring-[#ff304d]/[0.065]',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
