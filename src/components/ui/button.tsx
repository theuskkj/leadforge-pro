import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2438]/45 disabled:pointer-events-none disabled:opacity-45 active:scale-[0.985]',
  {
    variants: {
      variant: {
        default: 'bg-[#ff2438] text-white shadow-[0_8px_24px_rgba(255,36,56,.18)] hover:bg-[#e81f34] hover:shadow-[0_10px_28px_rgba(255,36,56,.24)]',
        ghost: 'bg-transparent text-zinc-300 hover:bg-white/[0.055] hover:text-white',
        secondary: 'border border-white/[0.07] bg-white/[0.055] text-zinc-100 hover:border-white/[0.12] hover:bg-white/[0.085]',
        outline: 'border border-white/[0.10] bg-transparent text-zinc-200 hover:border-[#ff2438]/30 hover:bg-[#ff2438]/[0.06] hover:text-white',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export function Button({ className, variant, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />
}
