import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-[9px] border border-[#29313a] bg-[#090c10] px-3.5 text-[12px] text-zinc-100 outline-none transition-colors hover:border-[#39434e] focus:border-[#d92d46] focus:ring-2 focus:ring-[#d92d46]/15',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
