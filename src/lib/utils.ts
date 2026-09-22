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
  let score = input.hasWebsite ? 5 : 45

  if (input.hasPhone) score += 15
  if (input.rating >= 4.5) score += 15
  else if (input.rating >= 4) score += 10
  else if (input.rating >= 3.5) score += 5

  if (input.reviewCount >= 300) score += 20
  else if (input.reviewCount >= 100) score += 15
  else if (input.reviewCount >= 30) score += 10
  else if (input.reviewCount >= 5) score += 5

  return Math.max(0, Math.min(100, Math.round(score)))
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

export function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function uid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}
