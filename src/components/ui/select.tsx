import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-11 w-full rounded-2xl border border-zinc-700 bg-[#1a1a1d] px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#ff2438]/50',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
