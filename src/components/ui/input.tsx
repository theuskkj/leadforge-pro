import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-xl border border-white/[0.08] bg-[#0d0e11] px-3.5 text-sm text-white outline-none transition placeholder:text-zinc-600 hover:border-white/[0.13] focus:border-[#ff2438]/45 focus:ring-4 focus:ring-[#ff2438]/[0.07]',
        className,
      )}
      {...props}
    />
  )
}
