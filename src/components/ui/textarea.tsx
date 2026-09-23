import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-28 w-full resize-y rounded-xl border border-white/[0.085] bg-[#090c11] px-3.5 py-3 text-[13px] leading-6 text-zinc-100 outline-none transition placeholder:text-zinc-600 hover:border-white/[0.14] focus:border-[#ff304d]/45 focus:bg-[#0b0e14] focus:ring-4 focus:ring-[#ff304d]/[0.065]',
        className,
      )}
      {...props}
    />
  )
}
