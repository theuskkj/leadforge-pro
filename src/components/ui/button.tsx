import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-[13px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff304d]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090b10] disabled:pointer-events-none disabled:opacity-45 active:translate-y-px',
  {
    variants: {
      variant: {
        default: 'border border-[#ff304d] bg-[#ff304d] text-white shadow-[0_8px_26px_rgba(255,48,77,.16)] hover:border-[#ff4a63] hover:bg-[#ff3c57] hover:shadow-[0_10px_32px_rgba(255,48,77,.22)]',
        ghost: 'border border-transparent bg-transparent text-zinc-400 hover:bg-white/[0.045] hover:text-white',
        secondary: 'border border-white/[0.08] bg-white/[0.045] text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,.025)] hover:border-white/[0.13] hover:bg-white/[0.07]',
        outline: 'border border-white/[0.10] bg-[#0b0e13]/75 text-zinc-200 hover:border-[#ff304d]/32 hover:bg-[#ff304d]/[0.055] hover:text-white',
        success: 'border border-[#25D366]/55 bg-[#25D366] text-[#06190d] shadow-[0_8px_24px_rgba(37,211,102,.12)] hover:border-[#48df80] hover:bg-[#3bda73] hover:shadow-[0_10px_30px_rgba(37,211,102,.18)]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export function Button({ className, variant, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />
}
