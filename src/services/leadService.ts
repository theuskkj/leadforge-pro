import { uid } from '../lib/utils'
import type { Activity, Lead, LeadStage } from '../types'

const LEADS_KEY = 'leadforge:leads'
const DATA_MIGRATION_KEY = 'leadforge:real-data-only:v1'

const legacyDemoNames = new Set([
  'NovaDrive Veículos',
  'Studio Linha Arquitetura',
  'Clínica Vitta',
  'Cantina Bella Serra',
  'Atlas Fitness',
  'Horizonte Imóveis',
])

function isLegacyDemoLead(lead: Lead) {
  return lead.id.startsWith('mock-') || legacyDemoNames.has(lead.name)
}

export function loadLeads() {
  try {
    const raw = localStorage.getItem(LEADS_KEY)
    if (!raw) {
      localStorage.setItem(DATA_MIGRATION_KEY, '1')
      return []
    }

    const parsed = JSON.parse(raw) as Lead[]
    const cleaned = parsed.filter((lead) => !isLegacyDemoLead(lead))

    if (!localStorage.getItem(DATA_MIGRATION_KEY)) {
      const migrated = cleaned.map((lead) => ({ ...lead, potentialValue: 0 }))
      localStorage.setItem(LEADS_KEY, JSON.stringify(migrated))
      localStorage.setItem(DATA_MIGRATION_KEY, '1')
      return migrated
    }

    if (cleaned.length !== parsed.length) {
      localStorage.setItem(LEADS_KEY, JSON.stringify(cleaned))
    }

    return cleaned
  } catch {
    return []
  }
}

function persist(leads: Lead[]) {
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads))
}

export function saveLead(leads: Lead[], lead: Lead) {
  const next = [...leads, lead]
  persist(next)
  return next
}

export function updateLead(leads: Lead[], leadId: string, patch: Partial<Lead>) {
  const next = leads.map((lead) =>
    lead.id === leadId ? { ...lead, ...patch, updatedAt: new Date().toISOString() } : lead,
  )
  persist(next)
  return next
}

export function deleteLead(leads: Lead[], leadId: string) {
  const next = leads.filter((lead) => lead.id !== leadId)
  persist(next)
  return next
}

export function duplicateLead(leads: Lead[], leadId: string) {
  const base = leads.find((lead) => lead.id === leadId)
  if (!base) return leads
  const duplicate: Lead = {
    ...base,
    id: uid(),
    name: `${base.name} (cópia)`,
    stage: 'novo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activities: [
      ...base.activities,
      { id: uid(), type: 'created', description: 'Lead duplicado', createdAt: new Date().toISOString() },
    ],
  }
  const next = [duplicate, ...leads]
  persist(next)
  return next
}

export function moveStage(leads: Lead[], leadId: string, stage: LeadStage, closedValue?: number) {
  const now = new Date().toISOString()
  const next = leads.map((lead) => {
    if (lead.id !== leadId) return lead
    return {
      ...lead,
      stage,
      potentialValue: stage === 'fechado' && closedValue !== undefined ? closedValue : lead.potentialValue,
      updatedAt: now,
      activities: [
        ...lead.activities,
        {
          id: uid(),
          type: (stage === 'fechado' ? 'closed' : 'stage') as Activity['type'],
          description: `Estágio alterado para ${stage}`,
          createdAt: now,
        },
      ],
    }
  })
  persist(next)
  return next
}

export function savePrompt(leads: Lead[], leadId: string, prompt: string) {
  const now = new Date().toISOString()
  const next = leads.map((lead) =>
    lead.id === leadId
      ? {
          ...lead,
          prompt,
          updatedAt: now,
          activities: [...lead.activities, { id: uid(), type: 'prompt' as Activity['type'], description: 'Prompt salvo', createdAt: now }],
        }
      : lead,
  )
  persist(next)
  return next
}

export function clearLeads() {
  persist([])
  return []
}
