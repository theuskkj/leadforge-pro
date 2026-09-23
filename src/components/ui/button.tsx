import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex h-10 items-center justify-center gap-2 rounded-[9px] px-3.5 text-[12px] font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef5269] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090c] disabled:pointer-events-none disabled:opacity-45',
  {
    variants: {
      variant: {
        default: 'border border-[#d92d46] bg-[#d92d46] text-white hover:border-[#e13c55] hover:bg-[#e13c55]',
        ghost: 'border border-transparent bg-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-white',
        secondary: 'border border-[#2a313a] bg-[#15191f] text-zinc-100 hover:border-[#39424d] hover:bg-[#1a1f26]',
        outline: 'border border-[#2a313a] bg-transparent text-zinc-200 hover:border-[#48515d] hover:bg-white/[0.025] hover:text-white',
        success: 'border border-[#25D366] bg-[#25D366] text-[#07120b] hover:border-[#48df80] hover:bg-[#3bda73]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export function Button({ className, variant, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />
}
