import type { InputHTMLAttributes } from 'react'

export function Checkbox(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="checkbox" className="h-4 w-4 rounded border-zinc-600 accent-[#ff2438]" {...props} />
}
