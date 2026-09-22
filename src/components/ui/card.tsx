import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-3xl border border-zinc-800 bg-[#141416] p-5 shadow-[0_0_30px_rgba(255,36,56,0.08)]', className)}
      {...props}
    />
  )
}
