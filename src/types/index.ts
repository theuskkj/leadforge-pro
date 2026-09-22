export type LeadStage = 'novo' | 'contatado' | 'proposta' | 'fechado'

export type ActivityType = 'created' | 'contact' | 'stage' | 'note' | 'prompt' | 'edit' | 'closed'

export interface Activity {
  id: string
  type: ActivityType
  description: string
  createdAt: string
}

export interface LeadSearchResult {
  id: string
  name: string
  niche: string
  city: string
  address: string
  phone?: string
  website?: string
  rating: number
  reviewCount: number
  hasWebsite: boolean
  priority: number
}

export interface Lead {
  id: string
  name: string
  niche: string
  country: string
  city: string
  address: string
  phone?: string
  website?: string
  rating: number
  reviewCount: number
  priority: number
  potentialValue: number
  stage: LeadStage
  lastContact?: string
  notes: string
  prompt?: string
  activities: Activity[]
  createdAt: string
  updatedAt: string
}

export interface WorkspaceSettings {
  workspaceName: string
  currency: 'BRL'
  defaultPotentialValue: number
  defaultResultLimit: number
  searchProvider: 'mock' | 'endpoint'
  endpointUrl: string
  compactMode: boolean
}

export interface SearchParams {
  country: string
  location: string
  niche: string
  limit: number
  onlyNoWebsite: boolean
  minRating?: number
  onlyWithPhone?: boolean
}
