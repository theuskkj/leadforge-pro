import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function computePriority(input: {
  hasWebsite: boolean
  rating: number
  reviewCount: number
  hasPhone: boolean
}) {
  const websiteScore = input.hasWebsite ? 10 : 40
  const ratingScore = Math.min(25, Math.max(0, (input.rating / 5) * 25))
  const reviewScore = Math.min(25, Math.log10(Math.max(1, input.reviewCount + 1)) * 12)
  const phoneScore = input.hasPhone ? 10 : 0
  return Math.max(0, Math.min(100, Math.round(websiteScore + ratingScore + reviewScore + phoneScore)))
}

export function mapsUrl(name: string, address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address}`)}`
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(value?: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

export function uid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}
