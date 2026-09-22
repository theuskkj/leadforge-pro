import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-11 w-full rounded-xl border border-white/[0.08] bg-[#0d0e11] px-3.5 text-sm text-white outline-none transition hover:border-white/[0.13] focus:border-[#ff2438]/45 focus:ring-4 focus:ring-[#ff2438]/[0.07]',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
