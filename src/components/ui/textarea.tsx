import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-28 w-full resize-y rounded-[9px] border border-[#29313a] bg-[#090c10] px-3.5 py-3 text-[12px] leading-5 text-zinc-100 outline-none transition-colors placeholder:text-zinc-700 hover:border-[#39434e] focus:border-[#d92d46] focus:ring-2 focus:ring-[#d92d46]/15',
        className,
      )}
      {...props}
    />
  )
}
