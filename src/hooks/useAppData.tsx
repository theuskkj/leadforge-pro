import { createContext, useContext, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  clearLeads,
  deleteLead,
  duplicateLead,
  loadLeads,
  moveStage,
  saveLead,
  savePrompt,
  updateLead,
} from '../services/leadService'
import { loadSettings, saveSettings } from '../services/settingsService'
import type { Lead, LeadStage, WorkspaceSettings } from '../types'

interface AppDataContextValue {
  leads: Lead[]
  settings: WorkspaceSettings
  setSettings: (settings: WorkspaceSettings) => void
  addLead: (lead: Lead) => void
  patchLead: (leadId: string, patch: Partial<Lead>) => void
  removeLead: (leadId: string) => void
  copyLead: (leadId: string) => void
  moveLeadStage: (leadId: string, stage: LeadStage, closedValue?: number) => void
  storePrompt: (leadId: string, prompt: string) => void
  resetLeads: () => void
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(() => loadLeads())
  const [settingsState, setSettingsState] = useState<WorkspaceSettings>(() => loadSettings())

  const value = useMemo<AppDataContextValue>(() => {
    return {
      leads,
      settings: settingsState,
      setSettings: (nextSettings) => {
        setSettingsState(nextSettings)
        saveSettings(nextSettings)
        toast.success('Configurações salvas')
      },
      addLead: (lead) => {
        setLeads((current) => saveLead(current, lead))
        toast.success('Lead salvo com sucesso')
      },
      patchLead: (leadId, patch) => {
        setLeads((current) => updateLead(current, leadId, patch))
        toast.success('Lead atualizado')
      },
      removeLead: (leadId) => {
        setLeads((current) => deleteLead(current, leadId))
        toast.success('Lead removido')
      },
      copyLead: (leadId) => {
        setLeads((current) => duplicateLead(current, leadId))
        toast.success('Lead duplicado')
      },
      moveLeadStage: (leadId, stage, closedValue) => {
        setLeads((current) => moveStage(current, leadId, stage, closedValue))
        toast.success('Estágio atualizado')
      },
      storePrompt: (leadId, prompt) => {
        setLeads((current) => savePrompt(current, leadId, prompt))
        toast.success('Prompt salvo no lead')
      },
      resetLeads: () => {
        setLeads(clearLeads())
        toast.success('Base de leads limpa')
      },
    }
  }, [leads, settingsState])

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) throw new Error('useAppData deve ser usado dentro de AppDataProvider')
  return context
}
