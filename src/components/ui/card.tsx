import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <section className={cn('pro-panel rounded-[14px] p-5 sm:p-6', className)} {...props} />
}
